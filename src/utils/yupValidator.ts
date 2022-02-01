import { object, string, boolean, number, date, InferType } from "yup";

/*
  {
    "product": "paid-post",
    "url": "https://channels.ft.com/en/bigdeal/healthtech-sectors-spectacular-surge-in-spacs-and-despacs/",
    "feature": "channel",
    "author": "Alphagrid",
    "sponsor": "Baker McKenzie",
    "articleName": "The healthtech sector’s spectacular surge in Spacs and de-Spacs",
    "videoName": "None",
    "videoType": "Animation",
    "hasVideo": true,
    "primaryTopic": "Companies",
    "secondaryTopic": "Health sector",
    "advertiserIndustry": "Legal",
    "app": "video",
    "publishDate": "2022-01-20",
    "isBranded": false,
    "contentType": "thought leadership",
    "campaign": "Big Deal",
    "server": "https://spoor-api.ft.com/px.gif",
    "title": "",
    "adbook_campaign_id": "308120"
  }
*/

const configSchema = object({
  product: string().equals(["paid-post"]),
  url: string().required().url(),
  feature: string().required().oneOf(["channel", "microsite"]),
  author: string().defined().default(""),
  sponsor: string().defined().default(""),
  articleName: string().defined().default(""),
  videoName: string().defined().default(""),
  videoType: string()
    .optional()
    .default("")
    .oneOf(["Feature", "Case study", "Interview", "Animation"]),
  hasVideo: boolean().defined(),
  primaryTopic: string().defined().default(""),
  secondaryTopic: string().defined().default(""),
  advertiserIndustry: string().defined().default(""),
  app: string().required().oneOf(["stream", "article", "video", "audio", "IG"]),
  publishDate: string().nullable().default(""),
  isBranded: boolean().defined(),
  contentType: string().defined().default(""),
  campaign: string().defined().default(""),
  server: string().equals(['https://spoor-api.ft.com/px.gif"']),
  title: string().defined().default(""),
  adbook_campaign_id: string().defined().default(""),
});

export type configType = InferType<typeof configSchema>;
