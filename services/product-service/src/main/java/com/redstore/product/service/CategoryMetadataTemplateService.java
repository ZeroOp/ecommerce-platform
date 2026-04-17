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
                        new TypeReference<>() {
                        }
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

    private List<MetadataFieldDefinition> matchByKeywords(String haystack) {
        if (containsAny(haystack, "laptop", "notebook", "chromebook", "macbook")) {
            return List.of(
                    field("processor", "Processor"),
                    field("ram", "RAM"),
                    field("storage", "Storage"),
                    field("os", "Operating system"),
                    field("screenSize", "Screen size"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "phone", "smartphone", "mobile")) {
            return List.of(
                    field("ram", "RAM"),
                    field("storage", "Storage"),
                    field("camera", "Camera"),
                    field("battery", "Battery"),
                    field("processor", "Processor"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "tablet", "ipad")) {
            return List.of(
                    field("storage", "Storage"),
                    field("screenSize", "Screen size"),
                    field("battery", "Battery"),
                    field("processor", "Processor"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "headphone", "earbud", "earphone", "headset")) {
            return List.of(
                    field("connectivity", "Connectivity"),
                    field("driver", "Driver / size"),
                    field("batteryLife", "Battery life"),
                    field("impedance", "Impedance"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "fridge", "refrigerator", "freezer")) {
            return List.of(
                    field("capacity", "Capacity"),
                    field("energyRating", "Energy rating"),
                    field("defrost", "Defrost type"),
                    field("color", "Color"),
                    field("dimensions", "Dimensions")
            );
        }
        if (containsAny(haystack, "washing", "washer", "laundry")) {
            return List.of(
                    field("capacity", "Load capacity"),
                    field("loadType", "Load type"),
                    field("spinSpeed", "Spin speed"),
                    field("energyRating", "Energy rating"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "dishwasher", "dish-washer")) {
            return List.of(
                    field("placeSettings", "Place settings"),
                    field("noiseLevel", "Noise level"),
                    field("energyRating", "Energy rating"),
                    field("cycles", "Wash programs"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "furniture", "sofa", "chair", "desk", "table", "bed", "wardrobe")) {
            return List.of(
                    field("material", "Material"),
                    field("dimensions", "Dimensions"),
                    field("weightCapacity", "Weight capacity"),
                    field("assembly", "Assembly"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "fashion", "apparel", "clothing", "shoes", "sneaker", "watch", "bag")) {
            return List.of(
                    field("color", "Color"),
                    field("material", "Material"),
                    field("size", "Size"),
                    field("fit", "Fit"),
                    field("care", "Care instructions")
            );
        }
        if (containsAny(haystack, "tv", "television", "oled", "qled", "monitor")) {
            return List.of(
                    field("screenSize", "Screen size"),
                    field("resolution", "Resolution"),
                    field("refreshRate", "Refresh rate"),
                    field("hdr", "HDR"),
                    field("ports", "Ports"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "ssd", "hdd", "nvme", "storage", "pendrive", "flash")) {
            return List.of(
                    field("capacity", "Capacity"),
                    field("interface", "Interface"),
                    field("formFactor", "Form factor"),
                    field("readSpeed", "Read speed"),
                    field("writeSpeed", "Write speed"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "camera", "lens", "dslr", "mirrorless")) {
            return List.of(
                    field("sensor", "Sensor"),
                    field("resolution", "Resolution"),
                    field("zoom", "Zoom"),
                    field("battery", "Battery"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "microwave", "oven", "appliance", "cooker")) {
            return List.of(
                    field("capacity", "Capacity"),
                    field("power", "Power"),
                    field("energyRating", "Energy rating"),
                    field("modes", "Modes"),
                    field("color", "Color")
            );
        }
        if (containsAny(haystack, "electronics", "gadget")) {
            return List.of(
                    field("warranty", "Warranty"),
                    field("power", "Power"),
                    field("connectivity", "Connectivity"),
                    field("color", "Color"),
                    field("dimensions", "Dimensions")
            );
        }
        // Generic catalog defaults (3–7 fields)
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
