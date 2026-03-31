

import { create } from 'zustand'

export const useCampaignStore = create((set) => ({
  campaignId:   null,
  status:       null,
  factSheet:    null,
  blogPost:     null,
  socialThread: null,
  emailTeaser:  null,
  editorNotes:  null,

  remixedContent:     null,
  consistencyReport:  null,
  audienceReactions:  null,

  activeTab: 'blog',

  setCampaignId:  (id)     => set({ campaignId: id }),
  setStatus:      (status) => set({ status }),
  setActiveTab:   (tab)    => set({ activeTab: tab }),

  loadCampaign: (data) => set({
    campaignId:         data.id,
    status:             data.status,
    factSheet:          data.fact_sheet,
    blogPost:           data.blog_post,
    socialThread:       data.social_thread,
    emailTeaser:        data.email_teaser,
    editorNotes:        data.editor_notes,
    remixedContent:     data.remixed_content,
    consistencyReport:  data.consistency_report,
    audienceReactions:  data.audience_reactions,
  }),

  setRemix:        (data) => set({ remixedContent: data }),
  setConsistency:  (data) => set({ consistencyReport: data }),
  setReactions:    (data) => set({ audienceReactions: data }),

  reset: () => set({
    campaignId: null, status: null, factSheet: null,
    blogPost: null, socialThread: null, emailTeaser: null,
    editorNotes: null, remixedContent: null,
    consistencyReport: null, audienceReactions: null,
  })
}))