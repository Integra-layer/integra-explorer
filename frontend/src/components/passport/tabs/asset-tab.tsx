"use client";

import {
  MapPin,
  Building2,
  Ruler,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { GlassCard } from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import type { AssetInfo } from "@/lib/api/passport-types";

interface AssetTabProps {
  data: AssetInfo;
  fieldPrivacy?: Record<string, boolean>;
}

export function AssetTab({ data, fieldPrivacy }: AssetTabProps) {
  const isPrivate = (field: string) =>
    fieldPrivacy?.[`asset.${field}`] === true;

  return (
    <div className="space-y-6">
      {/* Main image + gallery */}
      <GlassCard className="overflow-hidden">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Main image */}
          <div className="relative aspect-video md:col-span-2">
            {data.images.main ? (
              <img
                src={data.images.main}
                alt={data.assetName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <ImageIcon className="size-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Gallery thumbnails */}
          <div className="flex flex-row gap-2 p-4 md:flex-col">
            {data.images.gallery.length > 0 ? (
              data.images.gallery.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-video flex-1 overflow-hidden rounded-lg"
                >
                  <img
                    src={url}
                    alt={`${data.assetName} gallery ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  No gallery images
                </p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Property details grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-brand/10">
              <Building2 className="size-5 text-integra-brand" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Property Type</p>
              <p className="font-semibold">{data.propertyType}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-info/10">
              <Ruler className="size-5 text-integra-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Floor Space</p>
              {isPrivate("floorSpace") ? (
                <Badge variant="secondary">Private</Badge>
              ) : (
                <p className="font-semibold">
                  {data.floorSpace.toLocaleString()} sqm
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-success/10">
              <Calendar className="size-5 text-integra-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Date</p>
              <p className="font-semibold">
                {new Date(data.completionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-integra-warning/10">
              <MapPin className="size-5 text-integra-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold">
                {data.location.city}, {data.location.country}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Description */}
      {data.description && (
        <GlassCard className="p-6">
          <h3 className="mb-3 text-lg font-semibold">Description</h3>
          <p className="leading-relaxed text-muted-foreground">
            {data.description}
          </p>
        </GlassCard>
      )}

      {/* Location details */}
      <GlassCard className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Location Details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Street</p>
            <p className="font-medium">{data.location.street}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">City</p>
            <p className="font-medium">{data.location.city}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">State / Region</p>
            <p className="font-medium">{data.location.state}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Country</p>
            <p className="font-medium">{data.location.country}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Postal Code</p>
            <p className="font-medium">{data.location.postalCode}</p>
          </div>
          {data.location.coordinates && (
            <div>
              <p className="text-sm text-muted-foreground">Coordinates</p>
              <p className="font-mono text-sm">
                {data.location.coordinates.lat.toFixed(4)},{" "}
                {data.location.coordinates.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* Map placeholder */}
        {data.location.coordinates && (
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50">
            <div className="text-center">
              <MapPin className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Map view at {data.location.coordinates.lat.toFixed(4)},{" "}
                {data.location.coordinates.lng.toFixed(4)}
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
