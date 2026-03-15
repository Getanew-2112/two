import React from 'react';
import { useNavigate } from 'react-router-dom';

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: '🩺',
      title: 'General Consultation',
      description: 'Comprehensive medical examinations and health assessments by experienced physicians.',
      features: ['Physical Examination', 'Health Screening', 'Medical Advice', 'Preventive Care'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🔬',
      title: 'Laboratory Services',
      description: 'State-of-the-art laboratory testing with accurate and timely results.',
      features: ['Blood Tests', 'Urine Analysis', 'Microbiology', 'Pathology'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '💊',
      title: 'Pharmacy',
      description: 'Full-service pharmacy with a wide range of medications and health products.',
      features: ['Prescription Filling', 'OTC Medications', 'Health Supplements', 'Medication Counseling'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🏥',
      title: 'Emergency Care',
      description: '24/7 emergency medical services for urgent health conditions.',
      features: ['Immediate Care', 'Trauma Management', 'Critical Care', 'Ambulance Service'],
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '👶',
      title: 'Pediatric Care',
      description: 'Specialized healthcare services for infants, children, and adolescents.',
      features: ['Child Health Check-ups', 'Vaccinations', 'Growth Monitoring', 'Pediatric Consultations'],
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: '🤰',
      title: 'Maternal Health',
      description: 'Comprehensive care for expectant mothers and newborns.',
      features: ['Prenatal Care', 'Delivery Services', 'Postnatal Care', 'Family Planning'],
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: '🦷',
      title: 'Dental Services',
      description: 'Complete dental care for maintaining oral health and beautiful smiles.',
      features: ['Dental Check-ups', 'Teeth Cleaning', 'Fillings', 'Extractions'],
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: '👁️',
      title: 'Eye Care',
      description: 'Comprehensive eye examinations and vision care services.',
      features: ['Vision Testing', 'Eye Examinations', 'Prescription Glasses', 'Eye Disease Management'],
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: '💉',
      title: 'Vaccination',
      description: 'Immunization services for children and adults.',
      features: ['Routine Vaccinations', 'Travel Vaccines', 'Flu Shots', 'COVID-19 Vaccines'],
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: '🩹',
      title: 'Minor Surgery',
      description: 'Outpatient surgical procedures in a safe and sterile environment.',
      features: ['Wound Care', 'Suturing', 'Minor Procedures', 'Post-op Care'],
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '❤️',
      title: 'Chronic Disease Management',
      description: 'Ongoing care and monitoring for chronic health conditions.',
      features: ['Diabetes Care', 'Hypertension Management', 'Asthma Treatment', 'Regular Monitoring'],
      color: 'from-rose-500 to-rose-600'
    },
    {
      icon: '🧘',
      title: 'Health & Wellness',
      description: 'Programs focused on maintaining and improving overall health.',
      features: ['Health Education', 'Nutrition Counseling', 'Lifestyle Advice', 'Wellness Programs'],
      color: 'from-lime-500 to-lime-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏥</span>
              </div>
              <span className="text-xl font-bold text-blue-600">Patient Management</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => navigate('/home')} className="text-gray-700 hover:text-blue-600 transition-colors">
                <span className="mr-2">🏠</span>Home
              </button>
              <button onClick={() => navigate('/about')} className="text-gray-700 hover:text-blue-600 transition-colors">
                <span className="mr-2">ℹ️</span>About Us
              </button>
              <button onClick={() => navigate('/services')} className="text-blue-600 font-semibold">
                <span className="mr-2">⚙️</span>Services
              </button>
              <button onClick={() => navigate('/contact')} className="text-gray-700 hover:text-blue-600 transition-colors">
                <span className="mr-2">📞</span>Contact
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 border-2 border-blue-500 text-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium"
              >
                🔐 Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-blue-100">Comprehensive Healthcare Solutions for You and Your Family</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden">
              <div className={`bg-gradient-to-r ${service.color} p-6 text-white`}>
                <div className="text-6xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold">{service.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">{service.description}</p>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Register now to access our comprehensive healthcare services
          </p>
          <button
            onClick={() => navigate('/patient-register')}
            className="px-10 py-4 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-all transform hover:scale-105 font-bold text-lg shadow-2xl"
          >
            Register Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏥</span>
              </div>
              <span className="text-xl font-bold">Patient Management</span>
            </div>
            <p className="text-gray-400 mb-4">Agmas Medium Clinic</p>
            <p className="text-gray-500 text-sm">© 2024 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;
