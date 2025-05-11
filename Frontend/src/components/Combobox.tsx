import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover"; // Ensure these imports are correct
import { Button } from "@/components/ui/button"; // Adjust the import path as necessary
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"; // Adjust the import path as necessary
import { Check, ChevronsUpDown } from "lucide-react"; // Ensure these icons are imported
import { cn } from "@/lib/utils"; // Ensure this utility is imported correctly

interface Framework {
  value: string;
  label: string;
}

interface ComboboxProps {
  frameworks: Framework[];
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  onChange: (value: string) => void; // New prop for callback
}
export const Combobox: React.FC<ComboboxProps> = ({ frameworks, value, setValue, open, setOpen, onChange }) => {
  console.log('the frameworks are',frameworks);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[478px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command className="h-[280px]">
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    setValue(newValue);
                    onChange(newValue); // Call the callback with the new value
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};