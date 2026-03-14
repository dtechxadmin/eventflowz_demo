import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { serviceTypes, eventTypes } from "@/lib/utils";

export default function ClientInfoForm() {
  const { control, watch, setValue } = useFormContext();
  
  const minBudget = watch("minBudget");
  const maxBudget = watch("maxBudget");
  const eventType = watch("eventType");
  
  const handleMinBudgetChange = (value: number[]) => {
    setValue("minBudget", value[0]);
  };
  
  const handleMaxBudgetChange = (value: number[]) => {
    setValue("maxBudget", value[0]);
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium mb-6">Get a custom proposal</h3>
      <p className="text-neutral-600 mb-6">
        We're excited to learn more about you. Every event is unique, therefore we require a
        consultation to get the most accurate pricing. To start, please give us some basic
        information regarding your event below.
      </p>
      
      <FormField
        control={control}
        name="serviceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Services</FormLabel>
            <div className="flex flex-col space-y-2 mt-1">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="dj-mc" 
                  className="rounded border-gray-300 text-primary mr-2"
                  checked={field.value === 'dj_mc'}
                  onChange={() => field.onChange('dj_mc')}
                />
                <label htmlFor="dj-mc" className="text-sm">DJ + MC</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="live-music" 
                  className="rounded border-gray-300 text-primary mr-2"
                  checked={field.value === 'live_music'}
                  onChange={() => field.onChange('live_music')}
                />
                <label htmlFor="live-music" className="text-sm">L!VE Music</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="dj-fusion" 
                  className="rounded border-gray-300 text-primary mr-2"
                  checked={field.value === 'dj_fusion'}
                  onChange={() => field.onChange('dj_fusion')}
                />
                <label htmlFor="dj-fusion" className="text-sm">DJ Fusion</label>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="eventType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div>
        <Label>Estimated Investment</Label>
        <div className="border border-neutral-300 rounded-md p-4 mt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{formatCurrency(minBudget)}</span>
            <div className="flex items-center">
              <button type="button" className="text-primary text-sm">
                <Pencil className="h-3 w-3 inline mr-1" />
                Customize budget
              </button>
            </div>
            <span className="text-sm font-medium">{formatCurrency(maxBudget)}</span>
          </div>
          
          <div className="relative mb-6">
            <FormField
              control={control}
              name="minBudget"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      min={1000}
                      max={20000}
                      step={500}
                      onValueChange={handleMinBudgetChange}
                      className="mb-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="maxBudget"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      min={1000}
                      max={30000}
                      step={500}
                      onValueChange={handleMaxBudgetChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span>$1,000</span>
            <span>$5,000</span>
            <span>$10,000</span>
            <span>$15,000</span>
            <span>$20,000</span>
            <span>$30,000+</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Your First Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Last Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {eventType === 'wedding' && (
          <>
            <FormField
              control={control}
              name="partnerFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner's First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Partner's First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="partnerLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner's Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Partner's Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Phone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
