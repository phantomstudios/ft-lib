import {
  object,
  string,
  number,
  boolean,
  mixed,
  InferType,
  ValidationError,
} from "yup";

//transform passed values to first character uppercase and replace spaces with underscores
const unifyValuesTransform = (value: string) => {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1).toLowerCase().replace(" ", "_").replace("-", "_")
  );
};

const configSchema = object({
  product: string().equals(["paid-post"]),
  url: string().required().url(),
  feature: string().required().oneOf(["channel", "microsite"]),
  author: string().defined().default("").transform(unifyValuesTransform),
  sponsor: string().defined().default(""),
  articleName: string().defined().default(""),
  videoName: string().defined().default(""),
  videoType: string()
    .optional()
    .default("")
    .oneOf(["Feature", "Case study", "Interview", "Animation"]),
  hasVideo: boolean().optional().nullable(),
  primaryTopic: string().defined().default("").transform(unifyValuesTransform),
  secondaryTopic: string()
    .defined()
    .default("")
    .transform(unifyValuesTransform),
  advertiserIndustry: string().defined().default(""),
  app: string()
    .required()
    .oneOf([
      "stream",
      "article",
      "video",
      "Article_with_video",
      "audio",
      "IG",
      "photo-essay",
    ])
    .transform(unifyValuesTransform),
  publishDate: string().nullable().default(""),
  isBranded: boolean().defined(),
  contentType: string().defined().default("").transform(unifyValuesTransform),
  campaign: string().defined().default(""),
  server: string().equals(["https://spoor-api.ft.com/px.gif"]),
  title: string().defined().default(""),
  adbook_campaign_id: string().optional().default(""),
  source_id: string().optional(),
});

const gtmCustomEventSchema = object({
  category: string()
    .required()
    .oneOf([
      "Internal click",
      "External click",
      "Video",
      "Video:fallback",
      "Audio",
      "Scroll",
      "Share",
      "Form",
      "Header",
      "Footer",
    ]),
  action: string().required(),
  label: string().required(),
});

const origamiEventSchema = object({
  category: string()
    .required()
    .oneOf([
      "page",
      "video",
      "audio",
      "cta",
      "scroll",
      "brandedContent",
      "internal click",
      "external click",
      "share",
      "channel",
    ]),
  action: string().required(),
  app: string().nullable().notRequired(),
  product: string().nullable().notRequired(),
  source: string().nullable().notRequired(),
  meta: mixed().nullable().notRequired(),
  duration: number()
    .nullable()
    .notRequired()
    .when("category", {
      is: "video" || "audio",
      then: string().required(),
    }),
  progress: number()
    .nullable()
    .notRequired()
    .when("category", {
      is: "video" || "audio",
      then: string().required(),
    }),
});

export type ConfigType = InferType<typeof configSchema>;
export type GTMCustomEventType = InferType<typeof gtmCustomEventSchema>;
export type OrigamiEventType = InferType<typeof origamiEventSchema>;

export const validateConfig = (
  config: ConfigType
): ValidationError[] | undefined => {
  try {
    //Replace app value based on deprecated hasVideo field and then remove hasVideo
    if (config.hasVideo && config.app.toLowerCase() === "article") {
      config.app === "Article_with_video";
    }
    delete config.hasVideo;

    configSchema.validateSync(config, { strict: true, abortEarly: false });
  } catch (err: any) {
    err.errors?.map((err: ValidationError) => {
      console.error("FTTracker - config validation error: " + err);
    });
  }
  return undefined;
};

export const validateGTMCustomEvent = (
  event: GTMCustomEventType
): ValidationError[] | undefined => {
  try {
    gtmCustomEventSchema.validateSync(event, {
      strict: true,
      abortEarly: false,
    });
  } catch (err: any) {
    err.errors?.map((err: ValidationError) => {
      console.error("FTTracker - GTM custom event validation error: " + err);
    });
  }
  return undefined;
};

export const validateOrigamiEvent = (
  config: OrigamiEventType
): ValidationError[] | undefined => {
  try {
    origamiEventSchema.validateSync(config, {
      strict: true,
      abortEarly: false,
    });
  } catch (err: any) {
    err.errors?.map((err: ValidationError) => {
      console.error("FTTracker - Origami event validation error: " + err);
    });
  }
  return undefined;
};
