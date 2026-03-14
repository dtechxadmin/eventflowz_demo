import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { musicPreferences } from "@/lib/utils";

export default function PreferencesForm() {
  const { control, watch, setValue } = useFormContext();
  const [isAddGenreOpen, setIsAddGenreOpen] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [customGenres, setCustomGenres] = useState<Array<{ value: string; label: string }>>([]);
  
  const currentMusicPreferences = watch("musicPreferences") || [];
  
  const addCustomGenre = () => {
    if (!newGenreName.trim()) return;
    
    const sanitizedValue = newGenreName.toLowerCase().replace(/\s+/g, '_');
    const newGenre = { 
      value: `custom_${sanitizedValue}`, 
      label: newGenreName.trim() 
    };
    
    setCustomGenres([...customGenres, newGenre]);
    
    // Add the new genre to the music preferences
    const updatedPreferences = [...currentMusicPreferences, newGenre.value];
    setValue("musicPreferences", updatedPreferences);
    
    // Reset and close dialog
    setNewGenreName("");
    setIsAddGenreOpen(false);
  };
  
  const equipmentOptions = [
    { id: "microphones", label: "Microphones" },
    { id: "lighting", label: "Lighting" },
    { id: "photo_booth", label: "Photo Booth" },
    { id: "video_screens", label: "Video Screens" },
    { id: "staging", label: "Staging" },
  ];
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium mb-6">Music Preferences</h3>
      <p className="text-neutral-600 mb-6">
        Help us understand your music preferences to create the perfect atmosphere for your event.
      </p>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <FormLabel>What kind of music do you enjoy?</FormLabel>
          <Dialog open={isAddGenreOpen} onOpenChange={setIsAddGenreOpen}>
            <DialogTrigger asChild>
              <button 
                type="button"
                className="flex items-center text-xs text-green-600 hover:text-green-800"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Genre
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Custom Music Genre</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="genre-name" className="text-right text-sm">
                    Genre Name
                  </label>
                  <Input
                    id="genre-name"
                    value={newGenreName}
                    onChange={(e) => setNewGenreName(e.target.value)}
                    placeholder="e.g. R&B, 80s Rock"
                    className="col-span-3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent form submission
                        addCustomGenre();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddGenreOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={addCustomGenre}>
                  Add Genre
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <Controller
            control={control}
            name="musicPreferences"
            render={({ field }) => (
              <>
                {musicPreferences.map((option) => (
                  <div 
                    key={option.value} 
                    className="border border-neutral-300 rounded-md p-4 hover:border-primary cursor-pointer"
                  >
                    <div className="flex items-start">
                      <Checkbox
                        checked={field.value?.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            field.onChange([...currentValues, option.value]);
                          } else {
                            field.onChange(
                              currentValues.filter((val: string) => val !== option.value)
                            );
                          }
                        }}
                        className="mt-1"
                      />
                      <Label className="ml-2 block text-sm cursor-pointer">
                        <span className="font-medium">{option.label.split('(')[0].trim()}</span>
                        {option.label.includes('(') && (
                          <span className="block text-neutral-500">
                            ({option.label.split('(')[1].replace(')', '')})
                          </span>
                        )}
                      </Label>
                    </div>
                  </div>
                ))}
                
                {/* Custom genres added by the user */}
                {customGenres.map((genre) => (
                  <div 
                    key={genre.value} 
                    className="border border-neutral-300 rounded-md p-4 hover:border-primary cursor-pointer"
                  >
                    <div className="flex items-start">
                      <Checkbox
                        checked={currentMusicPreferences.includes(genre.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue("musicPreferences", [...currentMusicPreferences, genre.value]);
                          } else {
                            setValue("musicPreferences", 
                              currentMusicPreferences.filter((val: string) => val !== genre.value)
                            );
                          }
                        }}
                        className="mt-1"
                      />
                      <Label className="ml-2 block text-sm cursor-pointer">
                        <span className="font-medium">{genre.label}</span>
                        <span className="block text-green-600 text-xs">(Custom)</span>
                      </Label>
                    </div>
                  </div>
                ))}
              </>
            )}
          />
        </div>
      </div>
      
      <FormField
        control={control}
        name="specialSongs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Any special songs or music requests?</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter any specific songs or artists you'd like" 
                className="h-24" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="mb-6">
        <FormLabel className="mb-3">Do you need any additional equipment?</FormLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <Controller
            control={control}
            name="equipment"
            render={({ field }) => (
              <>
                {equipmentOptions.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <Checkbox
                      checked={field.value?.includes(option.id)}
                      onCheckedChange={(checked) => {
                        const currentValues = field.value || [];
                        if (checked) {
                          field.onChange([...currentValues, option.id]);
                        } else {
                          field.onChange(
                            currentValues.filter((val) => val !== option.id)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={option.id} className="ml-2 text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
