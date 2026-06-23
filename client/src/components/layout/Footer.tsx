import { Link } from 'wouter';
import { Twitter, Linkedin, Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a1526] text-white pt-16 pb-8 border-t-4 border-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <img src="/logo.png" alt="مجتمع مبادرة تسويقية" className="h-16 w-auto brightness-0 invert" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              شبكة مهنية رائدة لقادة التسويق والمستشارين ورواد الأعمال في العالم العربي. نهدف إلى تبادل المعرفة وبناء الشراكات وخلق فرص نوعية.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 font-display">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-secondary transition-colors text-sm">الرئيسية</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-secondary transition-colors text-sm">عن المجتمع</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-secondary transition-colors text-sm">الفعاليات</Link></li>
              <li><Link href="/knowledge" className="text-gray-400 hover:text-secondary transition-colors text-sm">مركز المعرفة</Link></li>
              <li><Link href="/join" className="text-gray-400 hover:text-secondary transition-colors text-sm">طلب انضمام</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 font-display">خدمات الأعضاء</h4>
            <ul className="space-y-3">
              <li><Link href="/members" className="text-gray-400 hover:text-secondary transition-colors text-sm">دليل الأعضاء</Link></li>
              <li><Link href="/opportunities" className="text-gray-400 hover:text-secondary transition-colors text-sm">لوحة الفرص</Link></li>
              <li><Link href="/discussions" className="text-gray-400 hover:text-secondary transition-colors text-sm">النقاشات</Link></li>
              <li><Link href="/profile" className="text-gray-400 hover:text-secondary transition-colors text-sm">الملف الشخصي</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 font-display">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <a href="mailto:info@marketing-initiative.com" className="hover:text-white transition-colors">info@marketing-initiative.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} مجتمع مبادرة تسويقية. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
