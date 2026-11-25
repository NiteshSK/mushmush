-- Preserve the previous storefront classification until staff review each sellable pack.
UPDATE products p SET "fulfillmentClass" = CASE WHEN
  EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON c.id=pc."categoryId" WHERE pc."productId"=p.id AND c.slug='edible')
  AND NOT EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON c.id=pc."categoryId" WHERE pc."productId"=p.id AND c.slug IN ('powders','tinctures'))
  AND p.title !~* '\\m(dried|dry|powder|tincture|extract)\\M' THEN 'fresh' ELSE 'national' END
WHERE "fulfillmentClass" IS NULL;
