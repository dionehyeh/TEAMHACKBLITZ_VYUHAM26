"use client";

import React, { useState, useEffect } from "react";
import {
  HardDrive,
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { api } from "../../services/api";
import { StoredFile } from "../../types";

export default function StoragePage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadFiles() {
      const data = await api.getFiles();
      setFiles(data);
    }
    loadFiles();
  }, []);

  const handleUploadSim = async () => {
    setIsUploading(true);
    setTimeout(async () => {
      const newFile = await api.uploadFile(
        "Sprint_26_Evaluation_Matrix.pdf",
        "application/pdf",
        2104500
      );
      setFiles([newFile, ...files]);
      setIsUploading(false);
    }, 700);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EDEDED]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#262626] flex items-center space-x-2">
            <HardDrive className="w-6 h-6 text-[#74D96F]" />
            <span>Asset Storage & Document Repository</span>
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Presigned URLs, zero-trust S3/MinIO attachments, and organizational asset catalog.
          </p>
        </div>

        <button
          onClick={handleUploadSim}
          disabled={isUploading}
          className="px-4 py-2 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{isUploading ? "Uploading to MinIO..." : "Upload New Asset"}</span>
        </button>
      </div>

      {/* Files Table / Grid */}
      <div className="rounded-3xl border border-[#BEBEBE]/40 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#262626]">
            <thead>
              <tr className="border-b border-[#EDEDED] text-[#666666] font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEDED]">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-[#EDEDED]/40 transition">
                  <td className="py-3 px-4 font-bold text-[#262626] flex items-center space-x-2.5">
                    {file.mimeType.includes("image") ? (
                      <ImageIcon className="w-4 h-4 text-[#74D96F] shrink-0" />
                    ) : file.mimeType.includes("pdf") ? (
                      <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <FileCode className="w-4 h-4 text-[#262626] shrink-0" />
                    )}
                    <span className="truncate max-w-xs">{file.filename}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#666666]">
                    {file.mimeType.split("/")[1] || "binary"}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#262626] font-medium">
                    {formatSize(file.byteSize)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        file.visibility === "restricted"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-[#74D96F]/20 text-[#1F541D] border border-[#74D96F]/40"
                      }`}
                    >
                      {file.visibility}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#666666]">{file.uploadedByName}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Presigned URL generated for ${file.filename} (Expires in 15 mins)`)}
                      className="p-2 rounded-full bg-[#EDEDED] hover:bg-[#E2E2E2] text-[#262626] border border-[#BEBEBE]/40 transition"
                      title="Download with Presigned URL"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
