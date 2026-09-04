import { useState } from "react";
import { Images, ZoomIn, Camera } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type GalleryItem = {
  id: number;
  src: string;
  title: string;
  category: string;
};

const categories = ["الكل", "فعاليات", "حلقات", "مسابقات", "تكريم", "أنشطة", "المرافق"];

const galleryItems: GalleryItem[] = [
  { id: 1, src: "/gallery/gallery-1.svg", title: "حفل ختم القرآن الكريم", category: "فعاليات" },
  { id: 2, src: "/gallery/gallery-2.svg", title: "يوم التخرج السنوي", category: "فعاليات" },
  { id: 3, src: "/gallery/gallery-3.svg", title: "حلقة التحفيظ الصباحية", category: "حلقات" },
  { id: 4, src: "/gallery/gallery-4.svg", title: "المسابقة القرآنية السنوية", category: "مسابقات" },
  { id: 5, src: "/gallery/gallery-5.svg", title: "تكريم الطلاب المتفوقين", category: "تكريم" },
  { id: 6, src: "/gallery/gallery-6.svg", title: "ورشة أحكام التجويد", category: "حلقات" },
  { id: 7, src: "/gallery/gallery-7.svg", title: "ندوة السيرة النبوية", category: "فعاليات" },
  { id: 8, src: "/gallery/gallery-8.svg", title: "إفطار رمضاني جماعي", category: "فعاليات" },
  { id: 9, src: "/gallery/gallery-9.svg", title: "رحلة تربوية ترفيهية", category: "أنشطة" },
  { id: 10, src: "/gallery/gallery-10.svg", title: "دورة الإجازات القرآنية", category: "حلقات" },
  { id: 11, src: "/gallery/gallery-11.svg", title: "مكتبة المعهد", category: "المرافق" },
  { id: 12, src: "/gallery/gallery-12.svg", title: "الحلقة المسائية", category: "حلقات" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const { isVisible, register } = useScrollReveal();

  const filtered =
    activeCategory === "الكل"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <PublicLayout>
      <PageHero
        badge="معرض الصور"
        icon={Images}
        title="المعرض"
        subtitle="لقطات من فعاليات المعهد وحلقاته ومسابقاته وأنشطته التربوية المتنوعة"
      />

      <section
        ref={register("gallery")}
        id="gallery"
        className={`container mx-auto px-4 pb-16 sm:pb-24 transition-all duration-1000 ${isVisible("gallery") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeading
          title="صور وفعاليات المعهد"
          subtitle="اضغط على أي صورة لعرضها بالحجم الكامل"
        />

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-300 ${
                activeCategory === category
                  ? "bg-gradient-to-r from-primary to-primary-light text-primary-foreground border-transparent shadow-lg scale-105"
                  : "bg-card text-muted-foreground border-primary/20 hover:border-primary hover:text-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div className="aspect-[4/3]">
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Zoom icon */}
              <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>

              {/* Category badge */}
              <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-secondary/90 border border-secondary-light/50 text-secondary-foreground text-xs font-bold shadow-lg">
                {item.category}
              </span>

              {/* Caption */}
              <div className="absolute bottom-0 inset-x-0 p-4 text-right translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h4 className="text-white font-bold text-base sm:text-lg drop-shadow-md">{item.title}</h4>
              </div>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>لا توجد صور في هذا التصنيف حالياً</p>
          </div>
        )}

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-12 text-center bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-primary/10">
          <Camera className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3">هل لديك صور جديدة؟</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
            يمكنك إرسال صور من فعاليات وحلقات المعهد ليتم نشرها في المعرض بعد مراجعتها
          </p>
          <Button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
          >
            تواصل معنا لإضافة الصور
          </Button>
        </div>
      </section>

      {/* Lightbox Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-3xl bg-card border-2 border-primary/20 overflow-hidden p-0">
          {selected && (
            <>
              <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10">
                <img
                  src={selected.src}
                  alt={selected.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
              <div className="p-5 sm:p-6 text-right">
                <DialogHeader>
                  <div className="flex items-center justify-between gap-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      {selected.category}
                    </span>
                  </div>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-primary mt-3">
                    {selected.title}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm sm:text-base mt-1">
                    من فعاليات معهد القرآن الكريم - يمكن استبدال هذه الصورة التجريبية بصورة حقيقية
                    بوضعها في مجلد public/gallery
                  </DialogDescription>
                </DialogHeader>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
};

export default Gallery;