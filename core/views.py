from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.conf import settings
from django.http import HttpResponse
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
    
    # Philosophy points for About section
    philosophy_points = [
        {
            'title': 'Bespoke Curation',
            'description': 'We reject off-the-shelf concepts in favor of tailor-made architecture. Each project is built around custom joinery, hand-selected organic stones, and curated lighting hierarchies.'
        },
        {
            'title': 'Restrained Minimalism',
            'description': 'Luxury is found in restraint. By eliminating noise and prioritizing spatial volume, soft textures, and natural daylight, we create environments that breathe tranquility and sophistication.'
        },
        {
            'title': 'Seamless Turnkey Execution',
            'description': 'From initial spatial planning and 3D visualization through site management and final styling, we deliver complete peace of mind with flawless execution standards.'
        }
    ]
    
    # Process steps
    process_steps = [
        {'number': '01', 'title': 'Discovery & Brief', 'description': 'Deep understanding of your lifestyle, aspirations, and spatial needs through immersive consultation sessions.'},
        {'number': '02', 'title': 'Concept & Visualization', 'description': 'Spatial storytelling through hand sketches, mood boards, and photorealistic 3D renderings for your approval.'},
        {'number': '03', 'title': 'Technical & Procurement', 'description': 'Detailed technical drawings, material specifications, and curated procurement of global artisanal pieces.'},
        {'number': '04', 'title': 'Execution & Styling', 'description': 'Meticulous site management, custom fabrication oversight, and final accessory styling for turnkey delivery.'}
    ]
    
    # Default testimonials for when none exist in database
    default_testimonials = [
        {'client_name': 'Ananya & Vikram', 'role_or_location': 'Private Villa, Jubilee Hills', 'quote': 'Meraki Space Studio transformed our villa into a sanctuary of understated elegance. Their attention to lighting and tactile materials is unmatched.'},
        {'client_name': 'Rohan Mehta', 'role_or_location': 'Penthouse Residence', 'quote': 'Flawless turnkey execution. They respected our timelines completely while delivering an interior that feels like a boutique gallery.'},
        {'client_name': 'Siddharth Rao', 'role_or_location': 'Commercial Space', 'quote': 'The spatial harmony they achieved in our studio office space elevated our entire brand identity. Highly recommended.'},
    ]
    
    # Marquee values
    marquee_values = [
        'Bespoke Curation', 'Restrained Minimalism', 'Seamless Turnkey Execution', 
        'Artisanal Craftsmanship', 'Spatial Poetry', 'Timeless Materiality', 
        'Luminous Atmospheres', 'Curated Living'
    ]
    
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
            
            # 2. Check API Key Presence
            brevo_key = os.environ.get('BREVO_API_KEY', '').strip()
            if not brevo_key:
                return HttpResponse("DIAGNOSTIC ERROR: BREVO_API_KEY environment variable is missing or empty on Render!", status=500)

            # 3. Trigger Brevo Email API
            try:
                configuration = sib_api_v3_sdk.Configuration()
                configuration.api_key['api-key'] = brevo_key

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

                response = api_instance.send_transac_email(send_smtp_email)
                print(f"Brevo API Success Response: {response}")
                
            except ApiException as e:
                return HttpResponse(f"BREVO API EXCEPTION: {e.body or str(e)}", status=500)
            except Exception as e:
                return HttpResponse(f"PYTHON EXCEPTION: {str(e)}", status=500)

            messages.success(request, "Thank you for reaching out! We will contact you shortly.")
            return redirect('home')
            
    context = {
        'featured_projects': featured_projects,
        'services': services,
        'about': about_data,
        'hero': hero_data,
        'testimonials': testimonials,
        'philosophy_points': philosophy_points,
        'process_steps': process_steps,
        'marquee_values': marquee_values,
        'default_testimonials': default_testimonials,
        'faq_items': [
            ('What is your typical project timeline?', 'Project timelines vary depending on scope and scale. A typical residential interior architecture or turnkey curation project ranges from 12 to 24 weeks from initial spatial planning through final styling and handover.'),
            ('Do you handle complete turnkey execution?', 'Yes. We provide complete end-to-end turnkey execution, managing everything from 3D visualization, custom joinery fabrication, and procurement to site supervision and final accessory styling.'),
            ('What regions or locations do you service?', 'While our primary studio is based in Jubilee Hills, Hyderabad, we undertake select residential and commercial architectural design projects across India and offer virtual design consulting worldwide.'),
            ('How do we initiate a project with Meraki Space Studio?', 'You can begin by submitting your project details through our consultation form below or reaching out directly via WhatsApp. Our principal team will review your inquiry and schedule an initial discovery call.'),
            ('What is your design fee structure?', 'Our fees are project-specific, typically structured as a percentage of the total project budget or a fixed fee based on scope. We provide transparent fee proposals after the initial discovery phase.'),
            ('Can you work with existing furniture or art?', 'Absolutely. We specialize in integrating cherished pieces into new spatial narratives, creating harmonious dialogues between old and new.'),
        ],
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

def service_detail(request, slug):
    service = get_object_or_404(Service, slug=slug)
    other_services = Service.objects.exclude(id=service.id)[:3]
    
    context = {
        'service': service,
        'other_services': other_services,
    }
    return render(request, 'service_detail.html', context)