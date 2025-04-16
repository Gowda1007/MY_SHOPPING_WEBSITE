// FilterSideBar.jsx
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

const FilterSideBar = ({
  categories,
  selectedCategory,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
  onClearSubcategories,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Categories</h3>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCategoryChange("")}
            >
              Clear
            </Button>
          )}
        </div>
        <ScrollArea className="h-[200px]">
          <div className="space-y-1 ">
            {Object.keys(categories).map((category) => (
              <Button
                key={category}
                variant="ghost"
                onClick={() => onCategoryChange(category)}
                className={`w-full hover:text-white justify-start text-left ${
                  selectedCategory === category
                    ? "bg-accent font-medium text-white"
                    : "hover:bg-muted/50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {selectedCategory && categories[selectedCategory]?.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Subcategories</h3>
              <Button variant="ghost" size="sm" onClick={onClearSubcategories}>
                Clear
              </Button>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {categories[selectedCategory].map((sub) => {
                  const isSelected = selectedSubcategories.includes(sub);

                  return (
                    <div
                      key={sub}
                      onClick={() => onSubcategoryChange(sub)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:text-black hover:bg-muted/50 "
                    >
                      <Checkbox
                        id={sub}
                        checked={isSelected}
                        onCheckedChange={() => onSubcategoryChange(sub)}
                      />
                      <label
                        htmlFor={sub}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed"
                      >
                        {sub}
                      </label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterSideBar;
