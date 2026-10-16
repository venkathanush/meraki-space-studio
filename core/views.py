from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import Service, Project, Inquiry, AboutSection, HeroSection, Testimonial
def home(request):
    featured_projects = Project.objects.filter(is_featured=True)[:6]
    services = Service.objects.all()
    about_data = AboutSection.objects.first()
    hero_data = HeroSection.objects.first() # Fetch Hero Section content
    testimonials = Testimonial.objects.filter(is_featured=True)[:3] # Fetch top 3 testimonials
    
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        project_type = request.POST.get('project_type')
        message = request.POST.get('message')
        
        if name and email and message:
            Inquiry.objects.create(
                name=name,
                email=email,
                phone=phone,
                project_type=project_type,
                message=message
            )
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

