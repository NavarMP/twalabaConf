import { FaInstagram, FaWhatsapp, FaTelegram } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-primary text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h3 className="text-xl font-bold font-poppins">SKSSF Twalaba Conference 2025</h3>
                        <p className="text-sm text-gray-300 mt-1">05, 06 December 2025</p>
                        <p className="text-sm text-gray-300">CBMS Islamic Academy, Vilayil-Parappur, Malappuram, Kerala</p>
                    </div>

                    <div className="flex space-x-6">
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white transition-colors"
                            aria-label="Instagram"
                        >
                            <FaInstagram className="h-6 w-6" />
                        </a>
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white transition-colors"
                            aria-label="WhatsApp"
                        >
                            <FaWhatsapp className="h-6 w-6" />
                        </a>
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white transition-colors"
                            aria-label="Telegram"
                        >
                            <FaTelegram className="h-6 w-6" />
                        </a>
                    </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} SKSSF Twalaba Wing. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
