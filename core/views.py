from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.conf import settings
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from .models import Service, Project, Inquiry, AboutSection, HeroSection, Testimonial
import os

def home(request):
    featured_projects = Project.objects.filter(is_featured=True)[:6]
    services = Service.objects.all()
    about_data = AboutSection.objects.first()
    hero_data = HeroSection.objects.first()
    testimonials = Testimonial.objects.filter(is_featured=True)[:3]
    
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        project_type = request.POST.get('project_type')
        message = request.POST.get('message')
        
        if name and email and message:
            # 1. Save submission to Supabase database
            Inquiry.objects.create(
                name=name,
                email=email,
                phone=phone,
                project_type=project_type,
                message=message
            )
            
            # 2. Send email notification via Brevo API
            try:
                configuration = sib_api_v3_sdk.Configuration()
                configuration.api_key['api-key'] = os.environ.get('BREVO_API_KEY', '')

                api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
                
                subject = f"New Consultation Inquiry from {name} - Meraki Space Studio"
                html_content = f"""
                <h3>New Project Inquiry Received</h3>
                <p><b>Name:</b> {name}</p>
                <p><b>Email:</b> {email}</p>
                <p><b>Phone:</b> {phone or 'N/A'}</p>
                <p><b>Project Type:</b> {project_type or 'N/A'}</p>
                <p><b>Message:</b><br>{message}</p>
                """
                
                sender = {"name": "Meraki Space Studio", "email": "merakispacestudio@gmail.com"}
                to = [{"email": "merakispacestudio@gmail.com", "name": "Studio Admin"}]
                reply_to = {"email": email, "name": name}
                
                send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                    to=to,
                    reply_to=reply_to,
                    sender=sender,
                    subject=subject,
                    html_content=html_content
                )

                api_instance.send_transac_email(send_smtp_email)
            except ApiException as e:
                from django.http import HttpResponse
                return HttpResponse(f"BREVO API EXCEPTION DEBUG: {str(e)}", status=500)
            except Exception as e:
                from django.http import HttpResponse
                return HttpResponse(f"GENERAL EXCEPTION DEBUG: {str(e)}", status=500)

            messages.success(request, "Thank you for reaching out! We will contact you shortly.")
            return redirect('home')
            
    context = {
        'featured_projects': featured_projects,
        'services': services,
        'about': about_data,
        'hero': hero_data,
        'testimonials': testimonials,
    }
    return render(request, 'index.html', context)

def project_list(request):
    category = request.GET.get('category')
    if category:
        projects = Project.objects.filter(category=category)
    else:
        projects = Project.objects.all()
        
    context = {
        'projects': projects,
        'selected_category': category,
        'categories': Project.CATEGORY_CHOICES,
    }
    return render(request, 'projects.html', context)

def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    related_projects = Project.objects.filter(category=project.category).exclude(id=project.id)[:3]
    
    context = {
        'project': project,
        'related_projects': related_projects,
    }
    return render(request, 'project_detail.html', context)