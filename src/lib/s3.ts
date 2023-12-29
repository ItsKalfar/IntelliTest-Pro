import { S3 } from "aws-sdk";

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  return new Promise((resolve, rejects) => {
    try {
      const s3 = new S3({
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        },
        params: {
          Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
        },
        region: "ap-south-1",
      });

      const file_key =
        "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

      const params = {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
        Key: file_key,
        Body: file,
      };

      s3.putObject(params, (err, data) => {
        return resolve({
          file_key,
          file_name: file.name,
        });
      });
    } catch (error) {
      rejects(error);
    }
  });
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.ap-south-1.amazonaws.com/${file_key}`;
  return url;
}
