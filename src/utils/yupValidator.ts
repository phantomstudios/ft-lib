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
    value.trim().charAt(0).toUpperCase() +
    value.trim().slice(1).toLowerCase().replace(/ /g, "_").replace(/-/g, "_")
  );
};

//replace legacy 'AlphaGrid'..
const authorTransform = (value: string) => {
  if (value.toLowerCase() === "alphagrid") {
    return "Alpha_Grid";
  }
  return (
    value.trim().charAt(0).toUpperCase() +
    value.trim().slice(1).toLowerCase().replace(/ /g, "_").replace(/-/g, "_")
  );
};

const configSchema = object({
  product: string().oneOf(["paid-post", "commercial-ft-com"]),
  url: string().required(),
  feature: string().required().oneOf(["channel", "microsite", "commercial"]),
  author: string().defined().default("").transform(authorTransform),
  sponsor: string().defined().default(""),
  articleName: string().defined().default(""),
  videoName: string().defined().default(""),
  videoType: string()
    .optional()
    .default("")
    .transform(unifyValuesTransform)
    .oneOf(["Feature", "Case_study", "Interview", "Animation", ""]),
  hasVideo: boolean().optional().nullable(),
  primaryTopic: string().defined().default("").transform(unifyValuesTransform),
  secondaryTopic: string()
    .defined()
    .default("")
    .transform(unifyValuesTransform),
  advertiserIndustry: string().defined().default(""),
  app: string()
    .required()
    .defined()
    .transform(unifyValuesTransform)
    .oneOf([
      "Stream",
      "Article",
      "Animated_article",
      "Immersive_article",
      "Video",
      "Article_with_video",
      "Audio",
      "Infographic",
      "Interactive_infographic",
      "Photo_essay",
      "home-page",
      "capabilities",
      "my-products",
      "audience",
      "case-studies",
      "markets",
      "news-and-insights",
      "others"
    ]),
  publishDate: string().nullable().default(""),
  isBranded: boolean().defined(),
  contentType: string().defined().default("").transform(unifyValuesTransform),
  campaign: string().defined().default(""),
  server: string().equals(["https://spoor-api.ft.com/px.gif"]),
  title: string().defined().default(""),
  adbook_campaign_id: string().optional().default(""),
  source_id: string().optional(),
  wordCount: number().optional(),
  commercial_product: string().optional().default("ft"),
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
      then: () => number().required(),
    }),
  progress: number()
    .nullable()
    .notRequired()
    .when("category", {
      is: "video" || "audio",
      then: () => number().required(),
    }),
});

export type ConfigType = InferType<typeof configSchema>;
export type GTMCustomEventType = InferType<typeof gtmCustomEventSchema>;
export type OrigamiEventType = InferType<typeof origamiEventSchema>;

export const parseConfig = (config: ConfigType): ConfigType => {
  try {
    //Replace app value based on deprecated hasVideo field and then remove hasVideo
    if (config.hasVideo && config.app.toLowerCase() === "article") {
      config.app === "Article_with_video";
    }

    delete config.hasVideo;
    //Parse wordCount as number if not already
    if (config.wordCount) {
      config.wordCount = Number(config.wordCount);
    }
    return configSchema.cast(config);
  } catch (err: any) {
    err.errors?.map((err: Error) => {
      console.error("FTTracker - config cast error: " + err);
    });
    return config;
  }
};

export const validateConfig = (
  config: ConfigType
): ValidationError[] | undefined => {
  try {
    configSchema.validateSync(config, {
      strict: false,
      abortEarly: false,
    });
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
    const parsedConfig = origamiEventSchema.cast(config);
    origamiEventSchema.validateSync(parsedConfig, {
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
