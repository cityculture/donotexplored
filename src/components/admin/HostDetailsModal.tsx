'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  ShieldCheck, 
  Building2, 
  Globe, 
  Instagram, 
  CreditCard, 
  Send,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { sendHostMessageAction } from '@/actions/admin.actions'
import { toast } from 'sonner'
import AdminModal from './AdminModal'

export default function HostDetailsModal({ host }: { host: any }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSendMessage = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      const result = await sendHostMessageAction(host.user_id, message)
      if (result.success) {
        toast.success('Message sent to host')
        setMessage('')
      } else {
        toast.error(result.error || 'Failed to send message')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => setIsOpen(true)}
        className="text-gray-300 hover:text-indigo-600"
      >
        <ExternalLink className="w-4 h-4" />
      </Button>

      <AdminModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Host Profile & KYC Details"
        maxWidth="3xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 -mt-2">
          {/* Left Column: Basic Info & Profile */}
          <div className="space-y-6">
            <section>
              <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
                <User className="w-3 h-3" /> Basic Information
              </h3>
              <div className="space-y-3 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Email</span>
                  <span className="font-black italic truncate max-w-[150px]">{host.user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Host Type</span>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-gray-200">
                    {host.host_type}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Location</span>
                  <span className="font-black italic flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {host.city}, {host.state}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Organisation Info
              </h3>
              <div className="space-y-3 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-xs font-bold text-gray-600 italic leading-relaxed">
                  {host.description || 'No description provided.'}
                </p>
                <div className="flex gap-4 pt-2">
                  {host.website_url && (
                    <a href={host.website_url} target="_blank" className="text-indigo-600 hover:text-gray-950 transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {host.instagram_handle && (
                    <a href={`https://instagram.com/${host.instagram_handle}`} target="_blank" className="text-indigo-600 hover:text-gray-950 transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Bank Details
              </h3>
              <div className="space-y-3 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Account Number</span>
                  <span className="font-black italic">{host.bank_account_number || 'NOT SET'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">IFSC Code</span>
                  <span className="font-black italic uppercase">{host.bank_ifsc_code || 'NOT SET'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">UPI ID</span>
                  <span className="font-black italic uppercase text-indigo-600">{host.upi_id || 'NOT SET'}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: KYC & Communication */}
          <div className="space-y-6">
            <section>
              <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> KYC & Verification
              </h3>
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">KYC Status</span>
                  <Badge 
                    variant={host.kyc_status === 'verified' ? 'success' : 'warning'}
                    className="text-[10px] font-black uppercase tracking-widest border-none"
                  >
                    {host.kyc_status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Documents Provided</p>
                  {host.kyc_documents ? (
                    <pre className="text-[10px] bg-white p-3 rounded-xl border border-gray-100 overflow-x-auto font-mono text-gray-600 italic max-h-40">
                      {JSON.stringify(host.kyc_documents, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-[10px] font-bold text-gray-400 italic">No documents uploaded.</p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Send className="w-3 h-3" /> Send Notification
              </h3>
              <div className="space-y-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                <textarea 
                  placeholder="Ask for missing documents, verify details..."
                  className="w-full h-32 bg-white border border-gray-100 rounded-2xl p-4 text-xs font-bold placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all italic resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={loading || !message.trim()}
                  className="w-full bg-indigo-600 hover:bg-gray-950 text-white rounded-2xl py-6 text-xs font-black italic uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
                >
                  {loading ? 'SENDING...' : 'SEND MSG TO HOST'}
                </Button>
              </div>
            </section>
          </div>
        </div>
      </AdminModal>
    </>
  )
}
