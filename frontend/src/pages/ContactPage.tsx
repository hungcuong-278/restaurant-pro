import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gr-black mb-4">
            Contact <span className="text-gr-gold">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get in touch with us for reservations, inquiries, or special events.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="premium-card">
            <h3 className="text-2xl font-bold text-gr-black mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gr-black">Address</h4>
                <p className="text-gray-600">123 Culinary Street<br />Gourmet District, GD 12345</p>
              </div>
              <div>
                <h4 className="font-semibold text-gr-black">Phone</h4>
                <p className="text-gray-600">(555) 123-4567</p>
              </div>
              <div>
                <h4 className="font-semibold text-gr-black">Email</h4>
                <p className="text-gray-600">info@restaurantpro.com</p>
              </div>
              <div>
                <h4 className="font-semibold text-gr-black">Hours</h4>
                <p className="text-gray-600">
                  Monday - Thursday: 5:00 PM - 10:00 PM<br />
                  Friday - Saturday: 5:00 PM - 11:00 PM<br />
                  Sunday: 5:00 PM - 9:00 PM
                </p>
              </div>
            </div>
          </div>
          
          <div className="premium-card">
            <h3 className="text-2xl font-bold text-gr-black mb-6">Send us a Message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={4} className="form-input" required></textarea>
              </div>
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;