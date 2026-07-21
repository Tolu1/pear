export const downloads = new sst.aws.Bucket("Downloads", {
  access: "public",
  transform: {
    bucket: {
      bucket: "pear-extension-downloads",
    },
  },
});
