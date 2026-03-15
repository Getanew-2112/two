import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

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
              <button onClick={() => navigate('/about')} className="text-blue-600 font-semibold">
                <span className="mr-2">ℹ️</span>About Us
              </button>
              <button onClick={() => navigate('/services')} className="text-gray-700 hover:text-blue-600 transition-colors">
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-slideInDown">About Agmas Medium Clinic</h1>
          <p className="text-xl text-blue-100 animate-fadeInUp delay-200">Committed to Excellence in Healthcare Since 2010</p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeInLeft hover-lift">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 hover-swing">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              To provide accessible, high-quality healthcare services to our community through 
              innovative technology and compassionate care. We strive to improve patient outcomes 
              by combining medical excellence with cutting-edge digital solutions.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeInRight hover-lift">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 hover-swing">
              <span className="text-4xl">👁️</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              To be the leading healthcare provider in Ethiopia, recognized for our patient-centered 
              approach, technological innovation, and commitment to improving community health. 
              We envision a future where quality healthcare is accessible to all.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-xl text-gray-600">A Journey of Care and Innovation</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Founded in 2010, Agmas Medium Clinic began with a simple yet powerful vision: 
                to provide world-class healthcare services to the Ethiopian community. What started 
                as a small clinic with a handful of dedicated healthcare professionals has grown into 
                a comprehensive medical facility serving thousands of patients annually.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                In 2024, we took a significant leap forward by implementing our state-of-the-art 
                Patient Management System. This digital transformation has revolutionized how we 
                deliver care, reducing wait times, improving patient experience, and enabling our 
                medical staff to focus on what matters most – providing excellent healthcare.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Today, Agmas Medium Clinic stands as a beacon of modern healthcare in Ethiopia, 
                combining traditional medical excellence with innovative technology to serve our 
                community better than ever before.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-xl text-gray-600">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow animate-scaleIn delay-100 hover-lift">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 hover-swing">
              <span className="text-5xl">❤️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Compassion</h3>
            <p className="text-gray-600">
              We treat every patient with empathy, respect, and dignity, understanding that 
              healthcare is deeply personal.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow animate-scaleIn delay-200 hover-lift">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 hover-swing">
              <span className="text-5xl">⭐</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Excellence</h3>
            <p className="text-gray-600">
              We maintain the highest standards in medical care, continuously improving our 
              services and expertise.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation</h3>
            <p className="text-gray-600">
              We embrace technology and new approaches to deliver better, more efficient 
              healthcare services.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🤝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Integrity</h3>
            <p className="text-gray-600">
              We operate with honesty and transparency, building trust with our patients 
              and community.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🌍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Community</h3>
            <p className="text-gray-600">
              We are committed to improving the health and wellbeing of the communities 
              we serve.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Teamwork</h3>
            <p className="text-gray-600">
              We collaborate across disciplines to provide comprehensive, coordinated care 
              for our patients.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Our Medical Team</h2>
          <p className="text-xl text-blue-100 mb-12">
            Experienced healthcare professionals dedicated to your wellbeing
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
              <div className="w-24 h-24 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👨‍⚕️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">8+ Doctors</h3>
              <p className="text-blue-100">Specialized physicians</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
              <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👩‍⚕️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">15+ Nurses</h3>
              <p className="text-blue-100">Caring nursing staff</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
              <div className="w-24 h-24 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔬</span>
              </div>
              <h3 className="text-xl font-bold mb-2">5+ Lab Techs</h3>
              <p className="text-blue-100">Expert laboratory team</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6">
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">3+ Pharmacists</h3>
              <p className="text-blue-100">Licensed pharmacists</p>
            </div>
          </div>
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

export default AboutUs;
