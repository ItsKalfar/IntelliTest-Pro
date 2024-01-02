"use client";

import Dropzone from "react-dropzone";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { uploadToS3 } from "@/lib/s3";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Cloud, File, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "./ui/progress";
import axios from "axios";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);

    return interval;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (
      files: Array<{ file_key: string; file_name: string }>
    ) => {
      const response = await axios.post("/api/create-chat", { files });
      return response.data;
    },
    onSuccess: ({ chat_id }) => {
      toast.success("Chat created!");
      const chatId: string = chat_id!;
      router.push(`/chats/${chatId}`);
    },
    onError: (err) => {
      toast.error("Error creating chat");
      console.error(err);
    },
  });

  return (
    <Dropzone
      accept={{ "application/pdf": [".pdf"] }}
      maxFiles={5}
      onDrop={async (acceptedFiles) => {
        let uploadedFiles: { file_key: string; file_name: string }[] = [];
        const progressInterval = startSimulatedProgress();
        const uploadPromises = acceptedFiles.map(async (file) => {
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`${file.name} is too large (max 10MB)`);
            return null;
          }
          try {
            setUploading(true);
            const data = await uploadToS3(file);
            if (!data?.file_key || !data.file_name) {
              toast.error("Something went wrong");
              return;
            }

            uploadedFiles.push({
              file_key: data.file_key,
              file_name: data.file_name,
            });
          } catch (error: any) {
            toast.error(error);
          } finally {
            setUploading(false);
            clearInterval(progressInterval);
            setUploadProgress(100);
          }
        });

        Promise.all(uploadPromises).then(() => {
          mutate(uploadedFiles);
        });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">PDF up to 10 MB</p>
              </div>
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}
              {uploading || isPending ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Redirecting...
                    </div>
                  ) : null}
                </div>
              ) : null}
              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const UploadButton = ({
  className,
  buttonText,
}: {
  className?: string;
  buttonText: string;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button className={className} variant={"outline"}>
          {buttonText} <File className="ml-2 mt-0.5 h-4 w-4" />{" "}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <FileUpload />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
