import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image as ImageIcon, Trash2, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Circle {
  id: string;
  name: string;
  group_name: string;
}

interface MonthlySummary {
  id: string;
  circle_id: string;
  image_url: string;
  created_at: string;
}

const AdminMonthlySummary = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentSummary, setCurrentSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    if (selectedCircleId) {
      fetchCurrentSummary();
    }
  }, [selectedCircleId]);

  const fetchCircles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('circles')
        .select('id, name, group_name')
        .order('name');

      if (error) throw error;
      setCircles(data || []);
    } catch (error) {
      console.error('Error fetching circles:', error);
      setMessage({ type: 'error', text: 'فشل في تحميل الحلقات' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('circle_monthly_summaries')
        .select('*')
        .eq('circle_id', selectedCircleId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCurrentSummary(data);
      if (data) {
        setImagePreview(data.image_url);
      } else {
        setImagePreview("");
      }
    } catch (error) {
      console.error('Error fetching current summary:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'يرجى اختيار ملف صورة فقط' });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedCircleId) {
      setMessage({ type: 'error', text: 'يرجى اختيار الحلقة' });
      return;
    }

    if (!imageFile) {
      setMessage({ type: 'error', text: 'يرجى اختيار صورة' });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      console.log('Starting upload process...');
      console.log('Circle ID:', selectedCircleId);
      console.log('File:', imageFile.name, imageFile.type, imageFile.size);

      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `monthly-summary-${selectedCircleId}-${Date.now()}.${fileExt}`;

      console.log('Uploading to storage with filename:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setMessage({ type: 'error', text: `فشل في رفع الصورة: ${uploadError.message}` });
        return;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Delete old summary if exists
      if (currentSummary) {
        console.log('Deleting old summary...');
        // Delete old image from storage
        try {
          const oldFileName = currentSummary.image_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('student-photos')
              .remove([oldFileName]);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
        }

        // Delete old record
        await supabase
          .from('circle_monthly_summaries')
          .delete()
          .eq('id', currentSummary.id);
      }

      // Insert new summary
      console.log('Inserting new record...');
      const { error: insertError } = await supabase
        .from('circle_monthly_summaries')
        .insert({
          circle_id: selectedCircleId,
          image_url: publicUrl
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        setMessage({ type: 'error', text: `فشل في حفظ البيانات: ${insertError.message}` });
        return;
      }

      console.log('Success!');
      setMessage({ type: 'success', text: 'تم رفع صورة المحصلة بنجاح' });
      setImageFile(null);
      await fetchCurrentSummary();
    } catch (error: any) {
      console.error('Error uploading summary:', error);
      setMessage({ type: 'error', text: `خطأ: ${error.message || 'فشل في رفع الصورة'}` });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentSummary) return;

    if (!confirm('هل أنت متأكد من حذف صورة المحصلة؟')) return;

    try {
      setUploading(true);

      // Delete image from storage
      try {
        const fileName = currentSummary.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('student-photos')
            .remove([fileName]);
        }
      } catch (err) {
        console.error('Error deleting image from storage:', err);
      }

      // Delete record
      const { error } = await supabase
        .from('circle_monthly_summaries')
        .delete()
        .eq('id', currentSummary.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'تم حذف صورة المحصلة بنجاح' });
      setCurrentSummary(null);
      setImagePreview("");
    } catch (error) {
      console.error('Error deleting summary:', error);
      setMessage({ type: 'error', text: 'فشل في حذف الصورة' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <AdminNavbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="islamic-card">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary text-right flex items-center gap-3">
                <ImageIcon className="w-8 h-8" />
                إدارة المحصلات الشهرية
              </CardTitle>
              <p className="text-muted-foreground text-right mt-2">
                رفع صورة المحصلة الشهرية لكل حلقة (صورة واحدة حالية لكل حلقة)
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {message && (
                <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  {message.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="circle" className="text-right block">اختر الحلقة</Label>
                <Select value={selectedCircleId} onValueChange={setSelectedCircleId}>
                  <SelectTrigger id="circle">
                    <SelectValue placeholder="اختر الحلقة" />
                  </SelectTrigger>
                  <SelectContent>
                    {circles.map((circle) => (
                      <SelectItem key={circle.id} value={circle.id}>
                        {circle.name} - {circle.group_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCircleId && (
                <>
                  {currentSummary && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-700 font-medium text-right mb-2">
                          الصورة الحالية للمحصلة:
                        </p>
                        <div className="relative">
                          <img 
                            src={currentSummary.image_url} 
                            alt="المحصلة الحالية"
                            className="w-full rounded-lg border-2 border-primary/20"
                          />
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleDelete}
                              disabled={uploading}
                              className="flex-1"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف الصورة
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(currentSummary.image_url, '_blank')}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 ml-2" />
                              عرض بحجم كامل
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Label htmlFor="image" className="text-right block">
                      {currentSummary ? 'رفع صورة جديدة (ستحل محل الصورة الحالية)' : 'رفع صورة المحصلة'}
                    </Label>
                    
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="image" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                        <p className="text-muted-foreground mb-2">
                          اضغط لاختيار صورة أو اسحب الصورة هنا
                        </p>
                        <p className="text-xs text-muted-foreground">
                          الحد الأقصى: 5 ميجابايت
                        </p>
                      </label>
                    </div>

                    {imagePreview && imageFile && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-right">معاينة الصورة الجديدة:</p>
                        <img 
                          src={imagePreview} 
                          alt="معاينة"
                          className="w-full rounded-lg border-2 border-primary/20"
                        />
                      </div>
                    )}

                    <Button
                      onClick={handleUpload}
                      disabled={!imageFile || uploading}
                      className="w-full"
                      size="lg"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 ml-2" />
                          {currentSummary ? 'تحديث الصورة' : 'رفع الصورة'}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminMonthlySummary;
