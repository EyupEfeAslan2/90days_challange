'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Sayfa 20px aşağıdan ve şeffaf başlar
      animate={{ opacity: 1, y: 0 }}  // Yerine oturur ve görünür olur
      transition={{ duration: 0.5, ease: "easeOut" }} // Yarım saniyede yumuşakça
    >
      {children}
    </motion.div>
  )
}