"""
Seed script for MedFinder comprehensive demo data.

Populates:
1. Master Medicine Catalog:
   - 8 Therapeutic categories
   - 40+ Medically accurate medicines with dosage forms, strengths, real descriptions,
     brand aliases, prescription requirements, and high-quality image URLs.
2. Verified Pharmacies for Owner 'worku0963@gmail.com':
   - 9 Branches spanning major Ethiopian cities:
     Addis Ababa (Bole, Piazza), Debre Berhan, Adama, Jimma, Gondar, Bahir Dar, Mekele, and Hawassa.
3. Staff Pharmacists:
   - At least 5 approved pharmacists per pharmacy (pharm_1@gmail.com ... pharm_45@gmail.com).
4. Live Inventory Listings:
   - Stock quantities, realistic ETB prices, and timestamps across fresh, aging, and stale intervals.

Run inside the backend container:
    docker compose exec backend python mock_data/seed_medicines.py
or from Django shell:
    docker compose exec backend python manage.py shell < mock_data/seed_medicines.py
"""

import os
import sys
from datetime import timedelta
from pathlib import Path

# Setup Django environment if running standalone
PROJECT_ROOT = Path(__file__).resolve().parent.parent
backend_dir = PROJECT_ROOT / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "medfinder.settings")

import django

django.setup()

from django.contrib.gis.geos import Point
from django.utils import timezone

from accounts.models import User
from inventory.models import Inventory
from medicines.models import Category, Medicine
from pharmacies.models import Pharmacy, PharmacyStaff


# ═══════════════════════════════════════════════════════════════════
# 1. MASTER MEDICINES DATASET (8 Categories, 40+ Medicines)
# ═══════════════════════════════════════════════════════════════════

SEED_CATEGORIES_AND_MEDICINES = [
    {
        "category": {
            "name": "Antibiotics & Antimicrobials",
            "description": "Agents used to treat and prevent bacterial infections by inhibiting bacterial cell wall synthesis, protein synthesis, or DNA replication.",
        },
        "medicines": [
            {
                "name": "Amoxicillin",
                "dosage_form": Medicine.DosageForm.CAPSULE,
                "strength": "500mg",
                "requires_prescription": True,
                "description": "Broad-spectrum aminopenicillin antibiotic used for respiratory, ear, and urinary tract infections. Common brands: Amoxil, Moxatag, Trimox, Ospamox.",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Ciprofloxacin",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "500mg",
                "requires_prescription": True,
                "description": "Second-generation fluoroquinolone antibiotic active against Gram-negative pathogens for UTIs and GI infections. Common brands: Cipro, Cifran, Ciloxan.",
                "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Azithromycin",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "500mg",
                "requires_prescription": True,
                "description": "Azalide macrolide antibiotic with long half-life for pneumonia, strep throat, and sinusitis. Common brands: Zithromax, Azithrocin, Z-Pak.",
                "image_url": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Cephalexin",
                "dosage_form": Medicine.DosageForm.CAPSULE,
                "strength": "500mg",
                "requires_prescription": True,
                "description": "First-generation oral cephalosporin antibiotic for superficial skin, bone, and urinary infections. Common brands: Keflex, Cefanox.",
                "image_url": "https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Doxycycline",
                "dosage_form": Medicine.DosageForm.CAPSULE,
                "strength": "100mg",
                "requires_prescription": True,
                "description": "Broad-spectrum tetracycline antibiotic for rickettsial infections, atypical pneumonia, acne, and malaria prophylaxis. Common brands: Vibramycin, Doryx.",
                "image_url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Metronidazole",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "400mg",
                "requires_prescription": True,
                "description": "Synthetic nitroimidazole antimicrobial and antiprotozoal for anaerobic bacterial infections and amoebiasis. Common brands: Flagyl, Metrogyl.",
                "image_url": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
            },
        ],
    },
    {
        "category": {
            "name": "Analgesics & Antipyretics",
            "description": "Medications formulated to alleviate pain (analgesia) and reduce elevated body temperature (antipyresis).",
        },
        "medicines": [
            {
                "name": "Paracetamol (Acetaminophen)",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "500mg",
                "requires_prescription": False,
                "description": "Non-opioid analgesic and antipyretic for headaches, fever, and musculoskeletal aches. Common brands: Panadol, Tylenol, Calpol, Efferalgan.",
                "image_url": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Ibuprofen",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "400mg",
                "requires_prescription": False,
                "description": "Non-steroidal anti-inflammatory drug (NSAID) for arthritis, fever, dental pain, and dysmenorrhea. Common brands: Advil, Motrin, Brufen, Nurofen.",
                "image_url": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Diclofenac Sodium",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "50mg",
                "requires_prescription": True,
                "description": "Potent phenylacetic acid NSAID for acute gout, rheumatoid arthritis, and post-traumatic inflammation. Common brands: Voltaren, Cataflam, Diclofen.",
                "image_url": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Tramadol Hydrochloride",
                "dosage_form": Medicine.DosageForm.CAPSULE,
                "strength": "50mg",
                "requires_prescription": True,
                "description": "Centrally acting synthetic opioid analgesic for moderate to severe acute or chronic pain. Common brands: Ultram, Tramal, Ralivia.",
                "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Aspirin (Acetylsalicylic Acid)",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "81mg",
                "requires_prescription": False,
                "description": "Low-dose antiplatelet aggregation therapy for cardiovascular event prevention and analgesia. Common brands: Bayer Aspirin, Aspro, Ecotrin.",
                "image_url": "https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Meloxicam",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "15mg",
                "requires_prescription": True,
                "description": "Preferential COX-2 inhibitor NSAID indicated for osteoarthritis and rheumatoid arthritis relief. Common brands: Mobic, Melox.",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            },
        ],
    },
    {
        "category": {
            "name": "Cardiovascular Agents",
            "description": "Therapeutics for cardiovascular diseases including essential hypertension, ischemic heart disease, heart failure, and hyperlipidemia.",
        },
        "medicines": [
            {
                "name": "Amlodipine Besylate",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "5mg",
                "requires_prescription": True,
                "description": "Long-acting dihydropyridine calcium channel blocker for essential hypertension and chronic angina. Common brands: Norvasc, Amlor, Istin.",
                "image_url": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Losartan Potassium",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "50mg",
                "requires_prescription": True,
                "description": "Oral angiotensin II receptor blocker (ARB) for hypertension and renal protection in diabetic patients. Common brands: Cozaar, Losar, Hyzaar.",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Atorvastatin Calcium",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "20mg",
                "requires_prescription": True,
                "description": "HMG-CoA reductase inhibitor (statin) for lowering LDL cholesterol and cardiovascular risk. Common brands: Lipitor, Atorlip, Torvast.",
                "image_url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Metoprolol Tartrate",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "50mg",
                "requires_prescription": True,
                "description": "Cardioselective beta-1 blocker for hypertension, angina pectoris, and post-myocardial infarction. Common brands: Lopressor, Betaloc, Seloken.",
                "image_url": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Hydrochlorothiazide",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "25mg",
                "requires_prescription": True,
                "description": "Thiazide diuretic for essential hypertension and fluid retention in heart failure. Common brands: Microzide, Esidrix, HydroDIURIL.",
                "image_url": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Enalapril Maleate",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "10mg",
                "requires_prescription": True,
                "description": "Angiotensin-converting enzyme (ACE) inhibitor for hypertension and symptomatic heart failure. Common brands: Vasotec, Renitec, Enam.",
                "image_url": "https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80",
            },
        ],
    },
    {
        "category": {
            "name": "Antidiabetic & Metabolic Agents",
            "description": "Medicines used to manage carbohydrate metabolism, control blood glucose levels in diabetes mellitus, and prevent diabetic microvascular complications.",
        },
        "medicines": [
            {
                "name": "Metformin Hydrochloride",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "500mg",
                "requires_prescription": True,
                "description": "Biguanide antihyperglycemic agent; first-line therapy for type 2 diabetes mellitus. Common brands: Glucophage, Formet, Riomet.",
                "image_url": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Glibenclamide (Glyburide)",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "5mg",
                "requires_prescription": True,
                "description": "Second-generation sulfonylurea oral hypoglycemic agent stimulating endogenous insulin secretion. Common brands: Daonil, Micronase, Glynase.",
                "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Insulin Human (Regular)",
                "dosage_form": Medicine.DosageForm.INJECTION,
                "strength": "100 IU/ml",
                "requires_prescription": True,
                "description": "Short-acting human insulin for intensive glycemic control in type 1 and type 2 diabetes. Common brands: Humulin R, Actrapid, Novolin R.",
                "image_url": "https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Empagliflozin",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "10mg",
                "requires_prescription": True,
                "description": "SGLT2 inhibitor reducing blood glucose and cardiorenal risk in type 2 diabetes and heart failure. Common brands: Jardiance.",
                "image_url": "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Sitagliptin Phosphate",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "100mg",
                "requires_prescription": True,
                "description": "Dipeptidyl peptidase-4 (DPP-4) inhibitor increasing active incretin levels to improve glycemic control. Common brands: Januvia, Xelevia.",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            },
        ],
    },
    {
        "category": {
            "name": "Respiratory & Antiallergic Agents",
            "description": "Therapeutic agents for bronchial asthma, chronic obstructive pulmonary disease (COPD), allergic rhinitis, bronchospasm, and urticaria.",
        },
        "medicines": [
            {
                "name": "Salbutamol (Albuterol)",
                "dosage_form": Medicine.DosageForm.INHALER,
                "strength": "100mcg/dose",
                "requires_prescription": False,
                "description": "Short-acting selective beta-2 adrenergic agonist bronchodilator for acute asthma bronchospasm relief. Common brands: Ventolin, ProAir, Asthalin.",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Cetirizine Hydrochloride",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "10mg",
                "requires_prescription": False,
                "description": "Second-generation selective H1 antihistamine for seasonal rhinitis, conjunctivitis, and urticaria. Common brands: Zyrtec, Cetrine, Alerid.",
                "image_url": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Fluticasone Propionate",
                "dosage_form": Medicine.DosageForm.INHALER,
                "strength": "125mcg/dose",
                "requires_prescription": True,
                "description": "Inhaled corticosteroid with potent anti-inflammatory action for maintenance control of persistent asthma and COPD. Common brands: Flovent, Flixotide.",
                "image_url": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Montelukast Sodium",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "10mg",
                "requires_prescription": True,
                "description": "Leukotriene receptor antagonist for prophylaxis and chronic treatment of bronchial asthma and allergic rhinitis. Common brands: Singulair, Montair.",
                "image_url": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Loratadine",
                "dosage_form": Medicine.DosageForm.SYRUP,
                "strength": "5mg/5ml",
                "requires_prescription": False,
                "description": "Non-sedating antihistamine syrup for pediatric and adult relief of allergic rhinitis and hives. Common brands: Claritin, Lorfast, Clarityne.",
                "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
            },
        ],
    },
    {
        "category": {
            "name": "Gastrointestinal Agents",
            "description": "Therapeutics for acid-peptic disorders, gastroesophageal reflux disease (GERD), peptic ulcers, nausea, and motility disorders.",
        },
        "medicines": [
            {
                "name": "Omeprazole",
                "dosage_form": Medicine.DosageForm.CAPSULE,
                "strength": "20mg",
                "requires_prescription": False,
                "description": "Proton pump inhibitor (PPI) suppressing gastric acid secretion; for GERD, peptic ulcers, and H. pylori eradication. Common brands: Prilosec, Losec, Omez.",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Pantoprazole Sodium",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "40mg",
                "requires_prescription": True,
                "description": "Delayed-release proton pump inhibitor for erosive esophagitis and Zollinger-Ellison syndrome. Common brands: Protonix, Pantocid, Controloc.",
                "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Metoclopramide Hydrochloride",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "10mg",
                "requires_prescription": True,
                "description": "Dopamine D2 receptor antagonist antiemetic and prokinetic agent for diabetic gastroparesis and nausea. Common brands: Reglan, Maxolon, Primperan.",
                "image_url": "https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Loperamide Hydrochloride",
                "dosage_form": Medicine.DosageForm.CAPSULE,
                "strength": "2mg",
                "requires_prescription": False,
                "description": "Synthetic opioid receptor agonist that slows intestinal motility for symptomatic relief of acute diarrhea. Common brands: Imodium, Lopex, Diastop.",
                "image_url": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
            },
        ],
    },
    {
        "category": {
            "name": "Dermatological Agents",
            "description": "Topical preparations for inflammatory dermatoses, superficial fungal infections, bacterial pyodermas, and burn wound care.",
        },
        "medicines": [
            {
                "name": "Hydrocortisone Acetate",
                "dosage_form": Medicine.DosageForm.CREAM,
                "strength": "1%",
                "requires_prescription": False,
                "description": "Mild topical corticosteroid for contact dermatitis, eczema, insect bites, and allergic skin eruptions. Common brands: Cortaid, Hytone.",
                "image_url": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Clotrimazole",
                "dosage_form": Medicine.DosageForm.CREAM,
                "strength": "1%",
                "requires_prescription": False,
                "description": "Broad-spectrum imidazole antifungal for tinea pedis (athlete's foot), ringworm, and cutaneous candidiasis. Common brands: Canesten, Lotrimin.",
                "image_url": "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Silver Sulfadiazine",
                "dosage_form": Medicine.DosageForm.CREAM,
                "strength": "1%",
                "requires_prescription": True,
                "description": "Topical bactericidal sulfonamide for prevention and treatment of wound sepsis in second- and third-degree burns. Common brands: Silvadene, Flamazine.",
                "image_url": "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80",
            },
        ],
    },
    {
        "category": {
            "name": "Vitamins, Minerals & Supplements",
            "description": "Nutritional therapeutics for the prevention and correction of dietary deficiencies, anemia, and metabolic support.",
        },
        "medicines": [
            {
                "name": "Vitamin D3 (Cholecalciferol)",
                "dosage_form": Medicine.DosageForm.CAPSULE,
                "strength": "50,000 IU",
                "requires_prescription": False,
                "description": "Fat-soluble secosteroid essential for calcium absorption, bone mineralization, and immune homeostasis. Common brands: Calcirol, D-Rise.",
                "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Ferrous Sulfate + Folic Acid",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "200mg / 0.4mg",
                "requires_prescription": False,
                "description": "Essential mineral and vitamin combination for prophylaxis and treatment of iron deficiency anemia in pregnancy and convalescence. Common brands: Fefol, Imeron.",
                "image_url": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Zinc Sulfate Monohydrate",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "20mg",
                "requires_prescription": False,
                "description": "Essential trace mineral for pediatric diarrhea management (WHO protocol), wound repair, and immune cellular defense. Common brands: Zinconia, Z-Plus.",
                "image_url": "https://images.unsplash.com/photo-1550572017-ed200f5e6343?w=600&auto=format&fit=crop&q=80",
            },
            {
                "name": "Vitamin B-Complex High Potency",
                "dosage_form": Medicine.DosageForm.TABLET,
                "strength": "B1+B6+B12 (100/100/1mg)",
                "requires_prescription": False,
                "description": "Neurotropic vitamin complex for peripheral neuropathy, metabolic exhaustion, and B-vitamin deficiencies. Common brands: Neurobion, Becosules, Polybion.",
                "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80",
            },
        ],
    },
]


# ═══════════════════════════════════════════════════════════════════
# 2. PHARMACIES DATASET (9 Verified Ethiopian City Branches)
# ═══════════════════════════════════════════════════════════════════

PHARMACIES_DATA = [
    {
        "name": "Lion Care Pharmacy - Bole Branch",
        "city": "Addis Ababa",
        "address": "Bole Road, Next to Edna Mall, Bole Subcity, Addis Ababa",
        "license_reference": "LCP-AA-BOLE-001",
        "phone_number": "+251911223344",
        "lng": 38.7892,
        "lat": 9.0014,
    },
    {
        "name": "Lion Care Pharmacy - Piazza Branch",
        "city": "Addis Ababa",
        "address": "Cunningham St, Near Churchill Ave, Arada Subcity, Piazza, Addis Ababa",
        "license_reference": "LCP-AA-PIAZZA-002",
        "phone_number": "+251911223345",
        "lng": 38.7511,
        "lat": 9.0345,
    },
    {
        "name": "Lion Care Pharmacy - Debre Berhan Central",
        "city": "Debre Berhan",
        "address": "Main Highway, Near Haile Resort & Hospital, Debre Berhan",
        "license_reference": "LCP-DB-MAIN-003",
        "phone_number": "+251911223346",
        "lng": 39.5342,
        "lat": 9.6784,
    },
    {
        "name": "Lion Care Pharmacy - Adama Central",
        "city": "Adama",
        "address": "Posta Bet Road, Kebele 04, Adama (Nazret)",
        "license_reference": "LCP-AD-CENTRAL-004",
        "phone_number": "+251911223347",
        "lng": 39.2694,
        "lat": 8.5412,
    },
    {
        "name": "Lion Care Pharmacy - Jimma Aba Jifar",
        "city": "Jimma",
        "address": "Hospital Road, Near Jimma University Specialized Hospital, Jimma",
        "license_reference": "LCP-JM-HOSP-005",
        "phone_number": "+251911223348",
        "lng": 36.8344,
        "lat": 7.6732,
    },
    {
        "name": "Lion Care Pharmacy - Gondar Royal",
        "city": "Gondar",
        "address": "Piazza Roundabout, Near Fasil Ghebbi Castle, Gondar",
        "license_reference": "LCP-GD-PIAZZA-006",
        "phone_number": "+251911223349",
        "lng": 37.4667,
        "lat": 12.6075,
    },
    {
        "name": "Lion Care Pharmacy - Bahir Dar Tana",
        "city": "Bahir Dar",
        "address": "Lake Tana Shore Avenue, Kebele 03, Bahir Dar",
        "license_reference": "LCP-BD-TANA-007",
        "phone_number": "+251911223350",
        "lng": 37.3908,
        "lat": 11.5936,
    },
    {
        "name": "Lion Care Pharmacy - Mekele Hill",
        "city": "Mekele",
        "address": "Hawelti Monument Street, Kedamay Weyane, Mekele",
        "license_reference": "LCP-MK-HAWELTI-008",
        "phone_number": "+251911223351",
        "lng": 39.4753,
        "lat": 13.4967,
    },
    {
        "name": "Lion Care Pharmacy - Hawassa Tabor",
        "city": "Hawassa",
        "address": "Piassa Commercial Street, Near Lake Hawassa Park, Hawassa",
        "license_reference": "LCP-HW-TABOR-009",
        "phone_number": "+251911223352",
        "lng": 38.4800,
        "lat": 7.0504,
    },
]


def seed_all():
    print("=" * 70)
    print("Starting MedFinder Comprehensive Demo Seeding")
    print("=" * 70)

    # 1. Ensure Pharmacy Owner User exists
    owner_email = "worku0963@gmail.com"
    owner, owner_created = User.objects.get_or_create(
        email=owner_email,
        defaults={
            "username": "worku0963",
            "first_name": "Worku",
            "last_name": "Owner",
            "role": User.Role.PHARMACIST,
        },
    )
    if owner_created or not owner.has_usable_password():
        owner.set_password("Password123!")
        owner.save()
    print(f"[{'Created' if owner_created else 'Found'}] Owner User: {owner.email}")

    # 2. Seed Master Medicine Catalog
    all_created_medicines = []
    for item in SEED_CATEGORIES_AND_MEDICINES:
        cat_data = item["category"]
        category, _ = Category.objects.get_or_create(
            name=cat_data["name"],
            defaults={"description": cat_data["description"]},
        )

        for med_data in item["medicines"]:
            medicine, _ = Medicine.objects.update_or_create(
                name=med_data["name"],
                defaults={
                    "category": category,
                    "dosage_form": med_data["dosage_form"],
                    "strength": med_data["strength"],
                    "description": med_data["description"],
                    "requires_prescription": med_data["requires_prescription"],
                    "image_url": med_data["image_url"],
                    "is_active": True,
                },
            )
            all_created_medicines.append(medicine)

    print(f"Seeded {len(all_created_medicines)} canonical medicines across {len(SEED_CATEGORIES_AND_MEDICINES)} categories.")

    # 3. Seed 9 Verified Pharmacies & 5 Staff Pharmacists per Pharmacy
    pharmacy_objects = []
    staff_counter = 1
    now = timezone.now()

    for idx, p_info in enumerate(PHARMACIES_DATA, start=1):
        pharmacy, p_created = Pharmacy.objects.get_or_create(
            license_reference=p_info["license_reference"],
            defaults={
                "owner": owner,
                "name": p_info["name"],
                "location": Point(p_info["lng"], p_info["lat"], srid=4326),
                "address": p_info["address"],
                "phone_number": p_info["phone_number"],
                "status": Pharmacy.Status.VERIFIED,
            },
        )
        if pharmacy.status != Pharmacy.Status.VERIFIED:
            pharmacy.status = Pharmacy.Status.VERIFIED
            pharmacy.save(update_fields=["status"])

        pharmacy_objects.append(pharmacy)
        print(f"\n[{'Created' if p_created else 'Verified'}] Pharmacy: {pharmacy.name} ({p_info['city']})")

        # Create 5 staff pharmacists for this pharmacy
        for _ in range(5):
            pharm_email = f"pharm_{staff_counter}@gmail.com"
            pharm_user, u_created = User.objects.get_or_create(
                email=pharm_email,
                defaults={
                    "username": f"pharm_{staff_counter}",
                    "first_name": f"Pharmacist",
                    "last_name": f"{staff_counter}",
                    "role": User.Role.PHARMACIST,
                },
            )
            if u_created or not pharm_user.has_usable_password():
                pharm_user.set_password("Password123!")
                pharm_user.save()

            # Link staff membership to this pharmacy
            membership, m_created = PharmacyStaff.objects.get_or_create(
                pharmacy=pharmacy,
                pharmacist=pharm_user,
                defaults={
                    "status": PharmacyStaff.Status.APPROVED,
                    "reviewed_by": owner,
                },
            )
            if membership.status != PharmacyStaff.Status.APPROVED:
                membership.status = PharmacyStaff.Status.APPROVED
                membership.reviewed_by = owner
                membership.save(update_fields=["status", "reviewed_by"])

            print(f"   -> Staff Pharmacist: {pharm_email} (Approved)")
            staff_counter += 1

    # 4. Seed Comprehensive Inventory Listings with Varied Freshness
    # Base price table per medicine index
    base_prices = [
        130.00, 240.00, 310.00, 180.00, 210.00, 95.00,
        45.00, 85.00, 120.00, 280.00, 60.00, 190.00,
        150.00, 175.00, 350.00, 140.00, 90.00, 130.00,
        110.00, 75.00, 1250.00, 680.00, 850.00,
        320.00, 50.00, 580.00, 420.00, 160.00,
        140.00, 260.00, 80.00, 95.00,
        120.00, 150.00, 380.00,
        450.00, 90.00, 65.00, 180.00,
    ]

    total_inventory_entries = 0
    for p_idx, pharmacy in enumerate(pharmacy_objects):
        # Stagger which medicines each pharmacy stocks for natural discovery
        for m_idx, medicine in enumerate(all_created_medicines):
            # Most pharmacies stock essential medicines; specialized ones vary
            if (m_idx + p_idx) % 7 == 0 and m_idx > 10:
                continue  # simulate out-of-stock / unstocked item

            base_price = base_prices[m_idx % len(base_prices)]
            # Slight price variance between regional branches (+/- 10%)
            price_offset = (p_idx * 5) % 30 - 15
            price = max(10.00, round(base_price + price_offset, 2))
            qty = 20 + ((m_idx * 13 + p_idx * 17) % 180)

            # Assign varied confirmation freshness:
            # 60% Fresh (1-10 hours ago), 25% Aging (18-36 hours ago), 15% Stale (55-90 hours ago)
            pattern = (m_idx + p_idx) % 10
            if pattern < 6:
                hours_ago = 1 + ((m_idx * 3 + p_idx) % 10)
            elif pattern < 8:
                hours_ago = 18 + ((m_idx * 5 + p_idx) % 18)
            else:
                hours_ago = 52 + ((m_idx * 7 + p_idx) % 38)

            confirmed_at = now - timedelta(hours=hours_ago)

            inv, _ = Inventory.objects.update_or_create(
                pharmacy=pharmacy,
                medicine=medicine,
                defaults={
                    "quantity_available": qty,
                    "price": price,
                    "last_confirmed_at": confirmed_at,
                },
            )
            total_inventory_entries += 1

    print("\n" + "=" * 70)
    print("Seed Complete!")
    print(f"Total Pharmacies: {len(pharmacy_objects)}")
    print(f"Total Staff Pharmacists: {staff_counter - 1}")
    print(f"Total Medicines Tracked: {len(all_created_medicines)}")
    print(f"Total Live Inventory Listings: {total_inventory_entries}")
    print("=" * 70)


# Execute seeding
seed_all()

