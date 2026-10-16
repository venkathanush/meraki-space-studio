from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Service, Project, Inquiry, AboutSection, ProjectImage, HeroSection, Testimonial
from unfold.admin import TabularInline  # Unfold inline styling

@admin.register(Service)
class ServiceAdmin(ModelAdmin):
    list_display = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'short_description')

class ProjectImageInline(TabularInline):
    model = ProjectImage
    extra = 3  # Gives you 3 upload slots by default
    fields = ['image', 'caption', 'order']

@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    list_display = ['title', 'category', 'location', 'is_featured', 'created_at']
    list_filter = ['category', 'is_featured']
    search_fields = ['title', 'location', 'client']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProjectImageInline]

@admin.register(Inquiry)
class InquiryAdmin(ModelAdmin):
    list_display = ('name', 'email', 'phone', 'project_type', 'is_read', 'created_at')
    list_filter = ('project_type', 'is_read', 'created_at')
    search_fields = ('name', 'email', 'phone', 'message')
    readonly_fields = ('created_at',)

@admin.register(AboutSection)
class AboutSectionAdmin(ModelAdmin):
    def has_add_permission(self, request):
        # Restrict to only 1 about section entry to keep it clean
        if AboutSection.objects.exists():
            return False
        return super().has_add_permission(request)

@admin.register(HeroSection)
class HeroSectionAdmin(ModelAdmin):
    def has_add_permission(self, request):
        if HeroSection.objects.exists():
            return False
        return super().has_add_permission(request)

@admin.register(Testimonial)
class TestimonialAdmin(ModelAdmin):
    list_display = ['client_name', 'role_or_location', 'rating', 'is_featured', 'created_at']
    list_filter = ['is_featured', 'rating']
    search_fields = ['client_name', 'quote', 'role_or_location']
