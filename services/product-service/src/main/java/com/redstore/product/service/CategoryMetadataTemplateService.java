package com.redstore.product.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.redstore.product.dto.MetadataFieldDefinition;
import com.redstore.product.entity.Category;
import com.redstore.product.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;

/**
 * Resolves the metadata field template a seller must fill in for a product.
 *
 * The storefront taxonomy mirrors {@code docs/images/Categories/} exactly:
 *   Mobiles     > Google | Samsung | Realme | Poco | Iphone
 *   Electronics > Audio | Wearables | Camara | Laptops | Storage | Tablet | Gaming
 *   Fashion     > Jeans | Shirts | Wedding | Watches | Shoes
 *   Furniture   > Dining | Sofas | Office chairs | Recliners | Tv Units | Beds | Mattresses
 *   Appliances  > Microwawe | Laundry | ACs | Television
 *
 * If a category has its own {@code metadataTemplateJson} (set by an admin) we
 * honour it. Otherwise we walk up the parent chain, join the slugs, and match
 * the most specific subcategory first, falling back to the parent, then a
 * tiny generic set.
 */
@Service
public class CategoryMetadataTemplateService {

    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    public CategoryMetadataTemplateService(CategoryRepository categoryRepository, ObjectMapper objectMapper) {
        this.categoryRepository = categoryRepository;
        this.objectMapper = objectMapper;
    }

    public List<MetadataFieldDefinition> resolveTemplate(Category category) {
        if (category.getMetadataTemplateJson() != null && !category.getMetadataTemplateJson().isBlank()) {
            try {
                List<MetadataFieldDefinition> parsed = objectMapper.readValue(
                        category.getMetadataTemplateJson(),
                        new TypeReference<>() {}
                );
                if (parsed != null && !parsed.isEmpty()) {
                    return parsed;
                }
            } catch (Exception ignored) {
                // fall through to inferred defaults
            }
        }
        return inferFromCategoryTree(category);
    }

    private List<MetadataFieldDefinition> inferFromCategoryTree(Category category) {
        LinkedList<Category> path = new LinkedList<>();
        Category current = category;
        int guard = 0;
        while (current != null && guard++ < 32) {
            path.addFirst(current);
            String pid = current.getParentCategoryId();
            if (pid == null || pid.isBlank()) {
                break;
            }
            current = categoryRepository.findById(pid).orElse(null);
        }
        String combined = path.stream()
                .map(Category::getSlug)
                .reduce((a, b) -> a + " " + b)
                .orElse("")
                .toLowerCase(Locale.ROOT);
        return matchByKeywords(combined);
    }

    /**
     * Subcategory-first matching. Most specific leaf wins; parent-only matches
     * are a last-resort before the generic default.
     */
    private List<MetadataFieldDefinition> matchByKeywords(String h) {
        // ---------- Mobiles subcategories (all phones) ----------
        if (containsAny(h, "mobile", "iphone", "samsung", "google", "poco", "realme", "smartphone")) {
            return List.of(
                    field("ram", "RAM"),
                    field("storage", "Storage"),
                    field("camera", "Camera"),
                    field("battery", "Battery"),
                    field("display", "Display")
            );
        }

        // ---------- Electronics subcategories ----------
        if (containsAny(h, "laptop", "notebook", "chromebook", "macbook")) {
            return List.of(
                    field("processor", "Processor"),
                    field("ram", "RAM"),
                    field("storage", "Storage"),
                    field("display", "Display"),
                    field("os", "Operating system")
            );
        }
        if (containsAny(h, "tablet", "ipad")) {
            return List.of(
                    field("processor", "Processor"),
                    field("ram", "RAM"),
                    field("storage", "Storage"),
                    field("display", "Display"),
                    field("os", "Operating system")
            );
        }
        if (containsAny(h, "audio", "headphone", "earbud", "earphone", "headset", "speaker", "soundbar")) {
            return List.of(
                    field("type", "Type"),
                    field("connectivity", "Connectivity"),
                    field("batteryLife", "Battery life"),
                    field("driver", "Driver / size"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "wearable", "smartwatch", "fitness-band", "fitness")) {
            return List.of(
                    field("display", "Display"),
                    field("batteryLife", "Battery life"),
                    field("waterResistance", "Water resistance"),
                    field("connectivity", "Connectivity"),
                    field("compatibility", "Compatibility")
            );
        }
        if (containsAny(h, "camara", "camera", "dslr", "mirrorless", "lens")) {
            return List.of(
                    field("sensor", "Sensor"),
                    field("resolution", "Resolution"),
                    field("zoom", "Zoom"),
                    field("battery", "Battery"),
                    field("lensMount", "Lens mount")
            );
        }
        if (containsAny(h, "storage", "ssd", "hdd", "nvme", "pendrive", "flash", "memory-card")) {
            return List.of(
                    field("capacity", "Capacity"),
                    field("interface", "Interface"),
                    field("readSpeed", "Read speed"),
                    field("writeSpeed", "Write speed"),
                    field("formFactor", "Form factor")
            );
        }
        if (containsAny(h, "gaming", "console", "playstation", "xbox", "nintendo")) {
            return List.of(
                    field("platform", "Platform"),
                    field("genre", "Genre"),
                    field("edition", "Edition"),
                    field("media", "Media"),
                    field("ageRating", "Age rating")
            );
        }

        // ---------- Fashion subcategories ----------
        if (containsAny(h, "jeans", "denim")) {
            return List.of(
                    field("size", "Size"),
                    field("fit", "Fit"),
                    field("material", "Material"),
                    field("wash", "Wash"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "shirt", "tshirt", "t-shirt")) {
            return List.of(
                    field("size", "Size"),
                    field("fit", "Fit"),
                    field("material", "Material"),
                    field("sleeve", "Sleeve"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "wedding", "sherwani", "lehenga", "saree", "ethnic")) {
            return List.of(
                    field("size", "Size"),
                    field("material", "Material"),
                    field("color", "Color"),
                    field("style", "Style"),
                    field("occasion", "Occasion")
            );
        }
        if (containsAny(h, "watch", "watches")) {
            return List.of(
                    field("movement", "Movement"),
                    field("material", "Case material"),
                    field("waterResistance", "Water resistance"),
                    field("band", "Band"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "shoe", "shoes", "sneaker", "footwear", "boot")) {
            return List.of(
                    field("size", "Size"),
                    field("material", "Material"),
                    field("style", "Style"),
                    field("gender", "Gender"),
                    field("color", "Color")
            );
        }

        // ---------- Furniture subcategories ----------
        if (containsAny(h, "dining")) {
            return List.of(
                    field("material", "Material"),
                    field("seatingCapacity", "Seating capacity"),
                    field("dimensions", "Dimensions"),
                    field("finish", "Finish"),
                    field("assembly", "Assembly")
            );
        }
        if (containsAny(h, "sofa", "couch", "sectional")) {
            return List.of(
                    field("material", "Material"),
                    field("seatingCapacity", "Seating capacity"),
                    field("dimensions", "Dimensions"),
                    field("style", "Style"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "office-chair", "office chairs", "office")) {
            return List.of(
                    field("material", "Material"),
                    field("adjustableHeight", "Adjustable height"),
                    field("armrests", "Armrests"),
                    field("weightCapacity", "Weight capacity"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "recliner")) {
            return List.of(
                    field("material", "Material"),
                    field("recliningPositions", "Reclining positions"),
                    field("motor", "Motor"),
                    field("weightCapacity", "Weight capacity"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "tv-unit", "tv units", "tv-units", "entertainment-unit")) {
            return List.of(
                    field("material", "Material"),
                    field("dimensions", "Dimensions"),
                    field("storage", "Storage"),
                    field("finish", "Finish"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "bed", "beds")) {
            return List.of(
                    field("size", "Size"),
                    field("material", "Material"),
                    field("storage", "Storage"),
                    field("headboard", "Headboard"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "mattress", "mattresses")) {
            return List.of(
                    field("size", "Size"),
                    field("thickness", "Thickness"),
                    field("type", "Type"),
                    field("firmness", "Firmness"),
                    field("material", "Material")
            );
        }

        // ---------- Appliances subcategories ----------
        if (containsAny(h, "microwawe", "microwave", "oven")) {
            return List.of(
                    field("capacity", "Capacity"),
                    field("power", "Power"),
                    field("modes", "Modes"),
                    field("type", "Type"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "laundry", "washer", "washing")) {
            return List.of(
                    field("capacity", "Load capacity"),
                    field("loadType", "Load type"),
                    field("spinSpeed", "Spin speed"),
                    field("energyRating", "Energy rating"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "ac ", "acs", "air-conditioner", "air conditioner")) {
            return List.of(
                    field("capacityTons", "Capacity (tons)"),
                    field("starRating", "Star rating"),
                    field("type", "Type"),
                    field("coolingCapacity", "Cooling capacity"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "television", "tv", "oled", "qled", "led")) {
            return List.of(
                    field("screenSize", "Screen size"),
                    field("resolution", "Resolution"),
                    field("refreshRate", "Refresh rate"),
                    field("hdr", "HDR"),
                    field("smartFeatures", "Smart features")
            );
        }

        // ---------- Parent-category fallbacks (anything under a parent but not a known leaf) ----------
        if (containsAny(h, "mobiles")) {
            return List.of(
                    field("ram", "RAM"),
                    field("storage", "Storage"),
                    field("camera", "Camera"),
                    field("battery", "Battery"),
                    field("display", "Display")
            );
        }
        if (containsAny(h, "electronics")) {
            return List.of(
                    field("brand", "Brand"),
                    field("warranty", "Warranty"),
                    field("power", "Power"),
                    field("connectivity", "Connectivity"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "fashion", "apparel", "clothing")) {
            return List.of(
                    field("size", "Size"),
                    field("material", "Material"),
                    field("fit", "Fit"),
                    field("color", "Color"),
                    field("care", "Care instructions")
            );
        }
        if (containsAny(h, "furniture")) {
            return List.of(
                    field("material", "Material"),
                    field("dimensions", "Dimensions"),
                    field("weightCapacity", "Weight capacity"),
                    field("assembly", "Assembly"),
                    field("color", "Color")
            );
        }
        if (containsAny(h, "appliances", "appliance")) {
            return List.of(
                    field("capacity", "Capacity"),
                    field("power", "Power"),
                    field("energyRating", "Energy rating"),
                    field("warranty", "Warranty"),
                    field("color", "Color")
            );
        }

        // ---------- Ultimate default (kept tiny on purpose) ----------
        return List.of(
                field("color", "Color"),
                field("material", "Material"),
                field("dimensions", "Dimensions"),
                field("weight", "Weight"),
                field("warranty", "Warranty")
        );
    }

    private boolean containsAny(String haystack, String... needles) {
        for (String n : needles) {
            if (haystack.contains(n)) {
                return true;
            }
        }
        return false;
    }

    private MetadataFieldDefinition field(String key, String label) {
        return new MetadataFieldDefinition(key, label);
    }

    /** Parses admin-provided JSON into definitions (used when saving categories). */
    public String serializeTemplate(List<MetadataFieldDefinition> defs) {
        if (defs == null || defs.isEmpty()) {
            return null;
        }
        try {
            List<MetadataFieldDefinition> copy = new ArrayList<>();
            for (MetadataFieldDefinition d : defs) {
                if (d != null && d.key() != null && !d.key().isBlank() && d.label() != null && !d.label().isBlank()) {
                    copy.add(new MetadataFieldDefinition(d.key().trim(), d.label().trim()));
                }
            }
            if (copy.isEmpty()) {
                return null;
            }
            return objectMapper.writeValueAsString(copy);
        } catch (Exception e) {
            return null;
        }
    }
}
