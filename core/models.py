from django.db import models

class Service(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    short_description = models.TextField()
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default="design_services", help_text="Unfold/Material icon name")
    image = models.ImageField(upload_to='services/')
    
    def __str__(self):
        return self.title

class Project(models.Model):
    CATEGORY_CHOICES = (
        ('residential', 'Residential Interiors'),
        ('commercial', 'Commercial Interiors'),
        ('hospitality', 'Hospitality Projects'),
        ('turnkey', 'Turnkey Projects'),
    )
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    client = models.CharField(max_length=150, blank=True, null=True)
    location = models.CharField(max_length=150)
    completion_date = models.DateField(blank=True, null=True)
    description = models.TextField()
    featured_image = models.ImageField(upload_to='projects/')
    is_featured = models.BooleanField(default=False, help_text="Display on homepage")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"

class Inquiry(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    project_type = models.CharField(max_length=50, choices=Project.CATEGORY_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Inquiry from {self.name} - {self.project_type}"

class AboutSection(models.Model):
    title = models.CharField(max_length=200, default="Designing With Soul & Intentional Elegance")
    subtitle = models.CharField(max_length=150, default="Our Philosophy")
    description = models.TextField(help_text="Main introductory philosophy text")
    image = models.ImageField(upload_to='about/', help_text="Upload lead designer or studio photo")
    founder_title = models.CharField(max_length=100, default="Founder & Principal Designer")
    founder_name = models.CharField(max_length=100, default="Meraki Creative Team")
    
    def __str__(self):
        return "About Us Section Content"

class ProjectImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='projects/gallery/')
    caption = models.CharField(max_length=200, blank=True, null=True, help_text="Optional caption for the photo")
    order = models.PositiveIntegerField(default=0, help_text="Display order")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.project.title} - Image {self.id}"

class HeroSection(models.Model):
    tagline = models.CharField(max_length=150, default="Designing With Soul")
    title = models.CharField(max_length=250, default="Timeless Luxury & Minimalist Interior Architecture")
    subtitle = models.TextField(default="We transform physical environments into emotive experiences, balancing aesthetic restraint with functional grandeur.")
    background_image = models.ImageField(upload_to='hero/', help_text="Upload hero background image")
    button_text = models.CharField(max_length=50, default="Start Your Consultation")

    def __str__(self):
        return "Hero Section Content"

class Testimonial(models.Model):
    client_name = models.CharField(max_length=150)
    role_or_location = models.CharField(max_length=150, help_text="e.g. Penthouse Owner, Jubilee Hills")
    quote = models.TextField(help_text="Client review or testimonial quote")
    rating = models.PositiveIntegerField(default=5, help_text="Star rating out of 5")
    is_featured = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.client_name} - {self.role_or_location}"