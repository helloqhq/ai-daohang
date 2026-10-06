"""Every priced provider/product must have a registered dynamic source."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class PricingSourceTests(unittest.TestCase):
    def test_priced_products_and_api_providers_have_enabled_verified_sources(self):
        entities=json.loads((ROOT/'config/entities.json').read_text())['entities']
        sources=json.loads((ROOT/'config/sources.json').read_text())['sources']
        plans=json.loads((ROOT/'public/data/pricing.json').read_text())['plans']
        sourced={eid for s in sources if s['enabled'] and s['verification']=='verified' and (s.get('feed_url') or s.get('offline_conversion')) for eid in s['entity_ids']}
        active=[e for e in entities if e['enabled'] and e['id'] in sourced]
        providers={e['pricing_provider'] for e in active if 'pricing_provider' in e}
        products={pid for e in active for pid in e.get('pricing_product_ids',[])}
        for plan in plans:
            with self.subTest(plan=plan['id']):
                if plan['category']=='api':self.assertIn(plan['provider'],providers)
                else:self.assertIn(plan['product_id'],products)

if __name__=='__main__':unittest.main()
