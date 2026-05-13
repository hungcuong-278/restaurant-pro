import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import APITestComponent from '../components/APITestComponent';
import UserStatusComponent from '../components/UserStatusComponent';
import AuthActivityLog from '../components/AuthActivityLog';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleReservationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      // If logged in, go directly to booking
      navigate('/reservations/new');
    } else {
      // If not logged in, save booking URL and redirect to login
      sessionStorage.setItem('redirectAfterLogin', '/reservations/new');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-gr-black bg-fixed"
        style={{ backgroundImage: "url('/images/hero-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        
        {/* Hero content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-wider">
            <span className="text-gr-gold">RESTAURANT</span>
            <br />
            <span className="text-white">PRO</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light text-gray-200">
            Experience culinary excellence with our premium dining and reservation management system
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleReservationClick}
              className="bg-gr-gold text-white text-lg px-10 py-4 uppercase font-bold tracking-widest hover:bg-opacity-90 transition-all duration-300 rounded-none shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
            >
              Book a Table
            </button>
            <Link
              to="/menu"
              className="border-2 border-gr-gold text-gr-gold bg-transparent text-lg px-10 py-4 uppercase font-bold tracking-widest hover:bg-gr-gold hover:text-white transition-all duration-300 rounded-none"
            >
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="py-24 bg-white text-gr-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif leading-tight">
              Bản Giao Hưởng Của Hai Chân Trời:<br/>
              <span className="text-gr-gold">Từ Trái Tim Châu Âu Đến Lòng Tự Hào Việt Nam</span>
            </h2>
            <div className="w-24 h-1 bg-gr-gold mx-auto mb-8"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8 text-lg text-gray-700 leading-relaxed font-light">
              <div>
                <h3 className="text-2xl font-bold text-gr-black mb-4 font-serif uppercase tracking-wider">Khởi Nguồn Từ Một Nỗi Nhớ</h3>
                <p className="italic text-gr-gold font-serif text-xl border-l-4 border-gr-gold pl-4 py-2 mb-4">
                  "Có những hương vị vượt qua ranh giới của không gian và thời gian, mang theo linh hồn của cả một nền văn hóa."
                </p>
                <p>
                  Câu chuyện của chúng tôi bắt đầu từ những đêm mùa đông lạnh giá tại lục địa già Châu Âu. Nơi đó, nghệ thuật ẩm thực không chỉ là thức ăn để lấp đầy dạ dày, mà là sự tôn kính tuyệt đối dành cho nguyên liệu, là sự sắc lẹm trong từng đường dao, và là sự nhẫn nại của những kỹ thuật nấu chậm truyền thống. Chúng tôi mang theo tình yêu mãnh liệt với nền ẩm thực cổ điển ấy trở về Việt Nam – không phải để sao chép một cách máy móc, mà để viết nên một kịch bản hương vị hoàn toàn mới.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gr-black mb-4 font-serif uppercase tracking-wider">Sự Giao Thoa Hoàn Mỹ</h3>
                <p className="mb-4">
                  Chúng tôi tin rằng, một món Âu thực thụ khi đặt giữa lòng Việt Nam không nên đóng vai một vị khách lạ lẫm, xa cách. Nó phải là một cuộc đối thoại đầy tinh tế.
                </p>
                <p>
                  Tại căn bếp này, kỹ thuật chế biến đỉnh cao của phương Tây được kết hợp nhịp nhàng với mảng màu tươi mới của nguyên liệu bản địa. Một chút thảo mộc nhiệt đới khéo léo giấu mình trong loại nước sốt vang đỏ sánh mịn. Một lát cắt thịt thăn bò hảo hạng được nâng tầm bởi sự cân bằng gia vị tài tình. Mỗi đĩa thức ăn được mang ra đều tuân theo một đường dây logic hoàn hảo từ thị giác, khứu giác đến vị giác.
                </p>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative rounded-none overflow-hidden shadow-2xl">
                <img 
                  src="/images/story-dish.png" 
                  alt="A beautifully plated European fine-dining dish with Asian tropical influences" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-gr-gold opacity-20 -z-10"></div>
              <div className="absolute -top-8 -right-8 w-48 h-48 border-2 border-gr-gold opacity-50 -z-10"></div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50 p-12 rounded-none border-l-4 border-gr-gold shadow-sm">
            <div>
              <h3 className="text-2xl font-bold text-gr-black mb-4 font-serif uppercase tracking-wider">Trải Nghiệm Đậm Chất Điện Ảnh</h3>
              <p className="text-gray-700 leading-relaxed font-light">
                Bước qua cánh cửa, mọi ồn ào của phố thị lập tức nhường chỗ cho một không gian được "đổ màu" đầy ẩn ý. Ánh đèn vàng trầm ấm, tiếng nhạc jazz du dương cùng âm thanh thanh thúy của những chiếc ly pha lê khẽ chạm vào nhau tạo nên một nhịp điệu êm ái. Khung cảnh nơi đây được thiết kế tỉ mỉ để bạn thực sự trở thành nhân vật chính trong bữa tối của mình – nơi mọi giác quan đều được đánh thức.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gr-black mb-4 font-serif uppercase tracking-wider">Lời Mời Gọi Từ Bếp Trưởng</h3>
              <p className="text-gray-700 leading-relaxed font-light mb-4">
                Chúng tôi không chỉ phục vụ một bữa ăn. Chúng tôi mời bạn bước vào một chuyến viễn du, nơi sự tinh tế, sang trọng của Châu Âu hòa quyện trọn vẹn cùng tâm hồn nồng hậu của người Việt.
              </p>
              <p className="text-gr-gold font-semibold italic text-lg">
                Hãy đến, tĩnh tại và để chúng tôi kể cho bạn nghe câu chuyện của mình, qua từng cung bậc của hương vị.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gr-black mb-4">
              Why Choose <span className="text-gr-gold">Restaurant Pro</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide an exceptional dining experience with state-of-the-art reservation management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Easy Reservations</h3>
              <p className="text-gray-600">Book your table in seconds with our intuitive reservation system</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Quality Service</h3>
              <p className="text-gray-600">Professional staff dedicated to making your experience memorable</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gr-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gr-black mb-2">Elegant Atmosphere</h3>
              <p className="text-gray-600">Sophisticated ambiance for memorable experiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* API Connection Test Section - Admin Only */}
      {isAdmin && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gr-black mb-4">
                🔧 Development <span className="text-gr-gold">API Test</span>
              </h2>
              <p className="text-lg text-gray-600">
                Testing Frontend-Backend Connection & User Authentication (Admin Only)
              </p>
            </div>
            <UserStatusComponent />
            <AuthActivityLog />
            <APITestComponent />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gr-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Dine with <span className="text-gr-gold">Excellence</span>?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Restaurant Pro for their dining experience
          </p>
          <button
            onClick={handleReservationClick}
            className="btn-primary text-lg px-8 py-4"
          >
            Make a Reservation
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;