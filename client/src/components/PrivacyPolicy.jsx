import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Share2, 
  Server, 
  UserCheck, 
  Baby, 
  Mail,
  CheckCircle2
} from "lucide-react";

const PrivacyPolicy = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 80, damping: 15 }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div
        className="max-w-4xl mt-20 mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border-t-4 border-[#eab308]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section with Custom Teal Background */}
        <motion.div 
          className="bg-[#014d4e] p-10 text-center relative overflow-hidden"
          variants={itemVariants}
        >
          {/* Decorative background circle */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#eab308] blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-[#eab308]/30 mb-5 shadow-lg">
              <ShieldCheck size={48} className="text-[#eab308]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
              Privacy Policy
            </h1>
            <p className="text-gray-300 text-lg font-light max-w-xl mx-auto">
              Transparency and trust are the foundation of our cinema.
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-1.5 bg-[#003839] rounded-full text-sm text-[#eab308] font-medium border border-[#eab308]/20">
              Last Updated: December 11, 2025
            </div>
          </div>
        </motion.div>

        {/* Content Body */}
        <div className="p-8 md:p-12 space-y-10">
          
          <motion.p className="text-gray-600 text-lg leading-relaxed border-l-4 border-[#014d4e] pl-6 italic" variants={itemVariants}>
            Welcome to <span className="font-bold text-[#014d4e]">Century Cinema</span>. 
            We are committed to protecting your personal information. This document outlines exactly how we collect, use, and safeguard your data.
          </motion.p>

          {/* Section 1 */}
          <Section 
            icon={<Eye className="text-[#eab308]" />} 
            title="1. Information We Collect" 
            variants={itemVariants}
          >
            <ul className="space-y-4 mt-2 text-gray-600">
              <ListItem label="Personal Information">Name, email, phone number, and payment details for bookings.</ListItem>
              <ListItem label="Automatically Collected">IP address, device type, and browsing behavior for analytics.</ListItem>
              <ListItem label="Cookies & Tracking">Used to remember your seat preferences and login status.</ListItem>
            </ul>
          </Section>

          {/* Section 2 */}
          <Section 
            icon={<Server className="text-[#eab308]" />} 
            title="2. How We Use Your Data" 
            variants={itemVariants}
          >
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-gray-600">
              <CheckItem>Process ticket bookings</CheckItem>
              <CheckItem>Send booking confirmations</CheckItem>
              <CheckItem>Improve app performance</CheckItem>
              <CheckItem>Legal compliance checks</CheckItem>
            </ul>
          </Section>

          {/* Section 3 & 4 Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <Section 
              icon={<Share2 className="text-[#eab308]" />} 
              title="3. Sharing Info" 
              variants={itemVariants}
            >
              <p className="text-gray-600 leading-relaxed text-sm">
                We <strong className="text-[#014d4e]">do not sell</strong> your data. We only share with trusted payment processors and legal authorities when strictly required.
              </p>
            </Section>

            <Section 
              icon={<Lock className="text-[#eab308]" />} 
              title="4. Data Security" 
              variants={itemVariants}
            >
              <p className="text-gray-600 leading-relaxed text-sm">
                We utilize industry-standard encryption (SSL) and secure servers to protect your payment and personal data from unauthorized access.
              </p>
            </Section>
          </div>

          {/* Section 5 & 6 */}
          <Section 
            icon={<UserCheck className="text-[#eab308]" />} 
            title="5. Your Rights" 
            variants={itemVariants}
          >
             <p className="text-gray-600">
               You maintain full control. You may request to access, correct, or delete your personal data at any time.
             </p>
          </Section>


          {/* Contact Section */}
          <motion.div 
            className="mt-8 p-8 bg-[#f8fafc] rounded-xl border border-gray-200 relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            {/* Decorative colored bar */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#eab308]"></div>

            <div className="flex items-start gap-5">
              <div className="p-3 bg-white shadow-sm rounded-full border border-gray-100">
                <Mail className="text-[#014d4e]" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#014d4e] mb-2">.6 Contact Us</h2>
                <p className="text-gray-600 mb-4">For any privacy concerns or questions:</p>
                <div className="flex flex-col sm:flex-row sm:gap-8 gap-2 text-sm">
                  <a href="mailto:info@centurycinema.com" className="flex items-center gap-2 font-semibold text-[#014d4e] hover:text-[#eab308] transition-colors">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]"></span>
                     centurycinema@gmail.com
                  </a>
                  <span className="flex items-center gap-2 font-semibold text-gray-700">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]"></span>
                     +251912345678
                     </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
        
        {/* Footer */}
        <div className="bg-[#014d4e] p-6 text-center text-gray-300 text-sm">
          &copy; {new Date().getFullYear()} Century Cinema. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

// --- Sub-Components ---

const Section = ({ icon, title, children, variants }) => (
  <motion.section 
    className="mb-2 group"
    variants={variants}
  >
    <div className="flex items-center gap-3 mb-4">
      {/* Icon container */}
      <div className="p-2.5 bg-[#014d4e]/5 rounded-lg group-hover:bg-[#014d4e]/10 transition-colors duration-300">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-[#014d4e]">{title}</h2>
    </div>
    <div className="pl-0 md:pl-14">
      {children}
    </div>
  </motion.section>
);

const ListItem = ({ label, children }) => (
  <li className="flex items-start gap-3">
    {/* Bullet Point using custom Gold color */}
    <span className="h-2 w-2 rounded-full bg-[#eab308] mt-2.5 flex-shrink-0 shadow-sm" />
    <span className="text-base">
      <strong className="text-[#014d4e] block sm:inline">{label}:</strong> 
      <span className="sm:ml-1">{children}</span>
    </span>
  </li>
);

const CheckItem = ({ children }) => (
  <li className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-transparent hover:border-[#eab308]/30 transition-all">
    <CheckCircle2 className="w-5 h-5 text-[#014d4e]" />
    <span className="text-sm font-medium text-gray-700">{children}</span>
  </li>
);

export default PrivacyPolicy;