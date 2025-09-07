'use client';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Download } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PPTGuidelines() {
  return (
    <section id="ppt-guidelines" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="font-display text-4xl md:text-6xl font-light mb-6 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-heading">Important</span>
            <br />
            <span className="text-subheading">Documents</span>
          </motion.h2>
          <motion.p
            className="font-body text-lg text-gray-400 max-w-3xl mx-auto font-light leading-relaxed tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Download the presentation template and review the guidelines. The PPT template is required for the hackathon, while guidelines are for your reference.
          </motion.p>
        </motion.div>

        {/* Documents Card */}
        <motion.div
          className="mx-auto max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 md:p-10 hover:border-heading/30 transition-all duration-500"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Important Notice */}
            <div className="mb-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-200 mb-2">Important Notice</h3>
                  <p className="text-amber-100/80 text-sm leading-relaxed">
                    The <strong>PPT template is mandatory</strong> for the actual hackathon presentation. 
                    The guidelines are for your reference to understand the rules and requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-6">
              {/* PPT Template */}
              <motion.div
                className="flex items-center justify-between p-6 bg-gray-800/30 rounded-xl border border-gray-700 hover:border-heading/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">SIH 2025 Idea Presentation Format</h3>
                    <p className="text-gray-400 text-sm">PowerPoint template for your hackathon presentation</p>
                  </div>
                </div>
                <a
                  href="https://www.sih.gov.in/letters/SIH2025-IDEA-Presentation-Format.pptx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download
                  <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Guidelines */}
              <motion.div
                className="flex items-center justify-between p-6 bg-gray-800/30 rounded-xl border border-gray-700 hover:border-heading/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">SIH 2025 Official Guidelines</h3>
                    <p className="text-gray-400 text-sm">Reference document for rules and requirements</p>
                  </div>
                </div>
                <a
                  href="https://sih.gov.in/letters/SIH2025-Guidelines-College-SPOC.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download
                  <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-gray-800/20 rounded-lg border border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">What to do with these documents?</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Use the PPT template for your hackathon presentation (mandatory)</li>
                    <li>• Review the guidelines to understand rules and requirements</li>
                    <li>• Follow the presentation format structure during the hackathon</li>
                    <li>• Keep the template ready for the actual event</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
