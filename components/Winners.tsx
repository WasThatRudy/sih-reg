'use client';
import { motion } from 'framer-motion';
import { winners, statistics } from '@/data/winners';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Winners() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="font-display text-4xl md:text-6xl font-light mb-8 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-heading">Previous</span>
            <br />
            <span className="text-subheading">Winners</span>
          </motion.h2>
          <motion.p 
            className="font-body text-lg text-gray-400 max-w-4xl mx-auto font-light leading-relaxed tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Celebrating innovation and excellence in the Smart India Hackathon by our peers and alumni.
          </motion.p>
        </motion.div>

        {/* Winners Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {winners.map((winner, index) => (
            <motion.div 
              key={index}
              className="group relative bg-gray-900/30 border border-gray-800 rounded-2xl p-8 hover:border-heading/30 transition-all duration-500"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Year Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="bg-heading/10 text-heading px-4 py-2 rounded-full text-sm font-medium border border-heading/20 tracking-wide">
                  {winner.year}
                </span>
                <span className="text-subheading/80 text-sm font-medium tracking-wide">{winner.category}</span>
              </div>
              
              {/* Team Name */}
              <h3 className="font-display text-xl font-light text-white mb-4 group-hover:text-subheading transition-colors duration-300 tracking-wide">
                {winner.teamName}
              </h3>
              
              {/* Project Title */}
              <p className="font-body text-gray-400 text-sm mb-6 leading-relaxed tracking-wide">
                {winner.projectTitle}
              </p>
              
              {/* Team Members */}
              <div className="mb-6">
                <h4 className="text-subheading/80 text-sm font-medium mb-3 tracking-wide">Team Members</h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                  {winner.members.map((member, idx) => (
                    <span key={idx} className="flex items-center font-body">
                      <div className="w-1.5 h-1.5 bg-subheading/40 rounded-full mr-3"></div>
                      {member}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Achievement */}
              <div className="pt-4 border-t border-gray-800">
                <span className="text-heading font-medium text-sm tracking-wide">
                  🏆 {winner.achievement}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistics */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {statistics.map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <div className={`font-display text-3xl md:text-4xl font-light text-${stat.color} mb-3 group-hover:scale-110 transition-transform duration-300 tracking-tight`}>
                {stat.number}
              </div>
              <div className="font-body text-gray-400 text-sm font-light tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
