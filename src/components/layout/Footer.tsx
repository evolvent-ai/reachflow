import { COMPANY_INFO, FOOTER_SECTIONS } from '@/constants';
import { getCurrentYear } from '@/utils/helpers';

export default function Footer() {
  const currentYear = getCurrentYear();

  return (
    <footer className="bg-[#0b1020] text-white py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/icon.png" 
                alt="联脉" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-lg font-bold">{COMPANY_INFO.name}</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {COMPANY_INFO.description}
            </p>
          </div>

          {/* Links */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} {COMPANY_INFO.copyright} · {COMPANY_INFO.icp}
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              隐私政策
            </a>
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              用户协议
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
