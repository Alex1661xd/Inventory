'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface ImageSliderProps {
    images: string[]
    name: string
    interval?: number
    showControls?: boolean
    className?: string
    imageClassName?: string
    allowZoom?: boolean
}

export function ImageSlider({
    images,
    name,
    interval = 3000,
    showControls = false,
    className,
    imageClassName,
    allowZoom = false
}: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isZoomOpen, setIsZoomOpen] = useState(false)

    useEffect(() => {
        if (images.length <= 1 || interval === 0) return
        const timer = setInterval(() => {
            if (!isZoomOpen) {
                setCurrentIndex((prev) => (prev + 1) % images.length)
            }
        }, interval)
        return () => clearInterval(timer)
    }, [images, interval, isZoomOpen])

    if (images.length === 0) {
        return (
            <div className={cn("w-full h-full flex items-center justify-center text-stone-300 text-5xl", className)}>
                📦
            </div>
        )
    }

    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // Distancia mínima para considerar un swipe
    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        } else if (isRightSwipe) {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
        }
    }

    const sliderContent = (
        <div
            className="relative w-full h-full overflow-hidden group touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {images.map((img, idx) => (
                <div
                    key={`${img}-${idx}`}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    <Image
                        src={img}
                        alt={`${name} - Imagen ${idx + 1}`}
                        fill
                        className={cn("object-cover", imageClassName)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={idx === 0}
                    />
                </div>
            ))}

            {/* Indicadores de posición */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm",
                                idx === currentIndex
                                    ? "bg-white w-6"
                                    : "bg-white/50 w-1.5 hover:bg-white/80"
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Controles laterales */}
            {(showControls && images.length > 1) && (
                <>
                    <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300"
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length) }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300"
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length) }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </>
            )}
        </div>
    )

    if (allowZoom) {
        return (
            <>
                <div
                    className={cn("w-full h-full cursor-pointer", className)}
                    onClick={() => setIsZoomOpen(true)}
                >
                    {sliderContent}
                </div>

                <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                    <DialogContent className="max-w-[95vw] h-[90vh] p-0 border-none bg-black/95">
                        <div className="w-full h-full flex items-center justify-center relative">
                            <div className="w-full h-full">
                                <ImageSlider
                                    images={images}
                                    name={name}
                                    interval={0}
                                    showControls={true}
                                    className="w-full h-full"
                                    imageClassName="object-contain"
                                    allowZoom={false}
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return (
        <div className={cn("w-full h-full", className)}>
            {sliderContent}
        </div>
    )
}
