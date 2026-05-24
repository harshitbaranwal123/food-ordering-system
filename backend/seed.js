import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
import foodModel from "./models/foodModel.js";
import userModel from "./models/userModel.js";
import orderModel from "./models/orderModel.js";

// ─── Menu / Food Data ────────────────────────────────────────────────
// image values match the filenames already present in backend/uploads/
const foodItems = [
  // ── Salad (4) ──────────────────────────────────────────────────────
  {
    name: "Greek Salad",
    description:
      "Crisp romaine, juicy tomatoes, cucumbers, red onion, Kalamata olives, and crumbled feta dressed in a tangy lemon-oregano vinaigrette.",
    price: 12,
    image: "1722865444288food_1.png",
    category: "Salad",
  },
  {
    name: "Veg Salad",
    description:
      "A vibrant medley of fresh seasonal vegetables tossed with herbs and a light balsamic glaze for a refreshing bite.",
    price: 18,
    image: "1722865514626food_2.png",
    category: "Salad",
  },
  {
    name: "Clover Salad",
    description:
      "Micro-greens, avocado, cherry tomatoes, and toasted pumpkin seeds finished with a citrus-honey dressing.",
    price: 16,
    image: "1722865628915food_3.png",
    category: "Salad",
  },
  {
    name: "Chicken Salad",
    description:
      "Tender grilled chicken breast over mixed greens with roasted corn, black beans, and a smoky chipotle-ranch dressing.",
    price: 24,
    image: "1722865668073food_4.png",
    category: "Salad",
  },

  // ── Rolls (4) ──────────────────────────────────────────────────────
  {
    name: "Lasagna Rolls",
    description:
      "Rolled lasagna sheets stuffed with ricotta, spinach, and mozzarella, baked in a rich marinara sauce.",
    price: 14,
    image: "1722865738489food_5.png",
    category: "Rolls",
  },
  {
    name: "Peri Peri Rolls",
    description:
      "Spicy peri-peri marinated chicken wrapped in a soft tortilla with crunchy slaw and garlic mayo.",
    price: 12,
    image: "1722865934153food_6.png",
    category: "Rolls",
  },
  {
    name: "Chicken Rolls",
    description:
      "Succulent seasoned chicken, pickled onions, and fresh lettuce rolled in a warm flour tortilla.",
    price: 20,
    image: "1722865976487food_7.png",
    category: "Rolls",
  },
  {
    name: "Veg Rolls",
    description:
      "Crispy spring rolls loaded with shredded cabbage, carrots, and glass noodles served with sweet chili dip.",
    price: 15,
    image: "1722866043779food_8.png",
    category: "Rolls",
  },

  // ── Deserts (4) ────────────────────────────────────────────────────
  {
    name: "Ripple Ice Cream",
    description:
      "Velvety vanilla ice cream swirled with ribbons of strawberry compote for a classic frozen treat.",
    price: 14,
    image: "1722866109947food_9.png",
    category: "Deserts",
  },
  {
    name: "Fruit Ice Cream",
    description:
      "A tropical blend of mango, passion fruit, and coconut churned into a creamy, dairy-free delight.",
    price: 22,
    image: "1722866148130food_10.png",
    category: "Deserts",
  },
  {
    name: "Jar Ice Cream",
    description:
      "Layers of brownie chunks, salted caramel, and chocolate ice cream served in a mason jar.",
    price: 10,
    image: "1722866329894food_11.png",
    category: "Deserts",
  },
  {
    name: "Vanilla Ice Cream",
    description:
      "Rich, old-fashioned vanilla bean ice cream made with real Madagascar vanilla and fresh cream.",
    price: 12,
    image: "1722866385025food_12.png",
    category: "Deserts",
  },

  // ── Sandwich (4) ───────────────────────────────────────────────────
  {
    name: "Chicken Sandwich",
    description:
      "Herb-grilled chicken, crispy bacon, Swiss cheese, and garlic aioli on toasted sourdough bread.",
    price: 12,
    image: "1722866412882food_13.png",
    category: "Sandwich",
  },
  {
    name: "Vegan Sandwich",
    description:
      "Roasted red pepper hummus, grilled zucchini, sun-dried tomatoes, and arugula on multigrain bread.",
    price: 18,
    image: "1722866469319food_14.png",
    category: "Sandwich",
  },
  {
    name: "Grilled Sandwich",
    description:
      "Golden-pressed sandwich with melted cheddar, caramelised onions, and Dijon mustard on ciabatta.",
    price: 16,
    image: "1722866504992food_15.png",
    category: "Sandwich",
  },
  {
    name: "Bread Sandwich",
    description:
      "Triple-decker club with turkey, ham, lettuce, tomato, and house-made mayo on white toast.",
    price: 24,
    image: "1722866560218food_16.png",
    category: "Sandwich",
  },

  // ── Cake (4) ───────────────────────────────────────────────────────
  {
    name: "Cup Cake",
    description:
      "Fluffy vanilla cupcakes topped with a swirl of buttercream frosting and rainbow sprinkles.",
    price: 14,
    image: "1722866610567food_17.png",
    category: "Cake",
  },
  {
    name: "Vegan Cake",
    description:
      "Moist chocolate cake made without eggs or dairy, finished with a silky coconut ganache.",
    price: 12,
    image: "1722866647952food_18.png",
    category: "Cake",
  },
  {
    name: "Butterscotch Cake",
    description:
      "Three layers of buttery sponge cake with caramelised butterscotch filling and praline crunch.",
    price: 20,
    image: "1722866694357food_19.png",
    category: "Cake",
  },
  {
    name: "Sliced Cake",
    description:
      "A generous slice of New York-style cheesecake with a graham-cracker crust and berry coulis.",
    price: 15,
    image: "1722866729053food_20.png",
    category: "Cake",
  },

  // ── Pure Veg (4) ───────────────────────────────────────────────────
  {
    name: "Garlic Mushroom",
    description:
      "Button mushrooms sautéed in garlic butter with fresh thyme, served on a bed of creamy polenta.",
    price: 14,
    image: "1722866777756food_21.png",
    category: "Pure Veg",
  },
  {
    name: "Fried Cauliflower",
    description:
      "Crispy spiced cauliflower florets with a golden chickpea-flour batter, served with mint chutney.",
    price: 22,
    image: "1722866830901food_22.png",
    category: "Pure Veg",
  },
  {
    name: "Mix Veg Pulao",
    description:
      "Fragrant basmati rice cooked with garden vegetables, whole spices, and a touch of saffron.",
    price: 10,
    image: "1722866871307food_23.png",
    category: "Pure Veg",
  },
  {
    name: "Rice Zucchini",
    description:
      "Lightly sautéed zucchini ribbons tossed with jasmine rice, lemon zest, and toasted pine nuts.",
    price: 12,
    image: "1722866909328food_24.png",
    category: "Pure Veg",
  },

  // ── Pasta (4) ──────────────────────────────────────────────────────
  {
    name: "Cheese Pasta",
    description:
      "Al dente penne smothered in a four-cheese sauce of cheddar, Gouda, Parmesan, and mozzarella.",
    price: 12,
    image: "1722866948105food_25.png",
    category: "Pasta",
  },
  {
    name: "Tomato Pasta",
    description:
      "Spaghetti in a slow-simmered San Marzano tomato sauce with fresh basil and extra-virgin olive oil.",
    price: 18,
    image: "1722867018540food_26.png",
    category: "Pasta",
  },
  {
    name: "Creamy Pasta",
    description:
      "Fettuccine Alfredo with a velvety cream-and-Parmesan sauce, garnished with cracked black pepper.",
    price: 16,
    image: "1722867053413food_27.png",
    category: "Pasta",
  },
  {
    name: "Chicken Pasta",
    description:
      "Penne with pan-seared chicken, roasted garlic, sun-dried tomatoes, and a light white wine cream sauce.",
    price: 24,
    image: "1722867110108food_28.png",
    category: "Pasta",
  },

  // ── Noodles (4) ────────────────────────────────────────────────────
  {
    name: "Butter Noodles",
    description:
      "Silky egg noodles tossed in brown butter with Parmesan, a pinch of nutmeg, and fresh parsley.",
    price: 14,
    image: "1722867144188food_29.png",
    category: "Noodles",
  },
  {
    name: "Veg Noodles",
    description:
      "Stir-fried hakka noodles loaded with bell peppers, cabbage, spring onions, and soy-sesame glaze.",
    price: 12,
    image: "1722867222977food_30.png",
    category: "Noodles",
  },
  {
    name: "Somen Noodles",
    description:
      "Chilled Japanese wheat noodles served with a dashi dipping sauce, grated ginger, and scallions.",
    price: 20,
    image: "1722867254829food_31.png",
    category: "Noodles",
  },
  {
    name: "Cooked Noodles",
    description:
      "Wok-tossed flat rice noodles with tofu, bean sprouts, crushed peanuts, and a tamarind sauce.",
    price: 15,
    image: "1722867630288food_32.png",
    category: "Noodles",
  },
];

// ─── Default Admin User ──────────────────────────────────────────────
const adminUser = {
  name: "Admin",
  email: "admin@fooddelivery.com",
  password: "admin123", // will be hashed before insert
  role: "admin",
  cartData: {},
};

// ─── Default Demo User ──────────────────────────────────────────────
const demoUser = {
  name: "Demo User",
  email: "demo@fooddelivery.com",
  password: "demo1234", // will be hashed before insert
  role: "user",
  cartData: {},
};

// ─── Seed Logic ──────────────────────────────────────────────────────
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/food-delivery";

async function seed() {
  try {
    console.log("🔗  Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅  Connected to MongoDB\n");

    const shouldClear = process.argv.includes("--clear");

    if (shouldClear) {
      console.log("🗑️   Clearing existing data...");
      await foodModel.deleteMany({});
      await userModel.deleteMany({});
      await orderModel.deleteMany({});
      console.log("✅  Cleared foods, users, and orders\n");
    }

    // ── Seed Food Items ────────────────────────────────────────────
    const existingFoodCount = await foodModel.countDocuments();
    if (existingFoodCount > 0 && !shouldClear) {
      console.log(
        `⏭️   Skipping food seeding — ${existingFoodCount} items already exist. Use --clear to reset.`
      );
    } else {
      console.log(`🍔  Seeding ${foodItems.length} food items...`);
      await foodModel.insertMany(foodItems);
      console.log(`✅  Inserted ${foodItems.length} food items\n`);
    }

    // ── Seed Users ─────────────────────────────────────────────────
    const salt = Number(process.env.SALT) || 10;

    // Admin
    const existingAdmin = await userModel.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log(`⏭️   Admin user already exists (${adminUser.email})`);
    } else {
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      await userModel.create({ ...adminUser, password: hashedPassword });
      console.log(`✅  Created admin user: ${adminUser.email}`);
    }

    // Demo user
    const existingDemo = await userModel.findOne({ email: demoUser.email });
    if (existingDemo) {
      console.log(`⏭️   Demo user already exists (${demoUser.email})`);
    } else {
      const hashedPassword = await bcrypt.hash(demoUser.password, salt);
      await userModel.create({ ...demoUser, password: hashedPassword });
      console.log(`✅  Created demo user: ${demoUser.email}`);
    }

    // ── Summary ────────────────────────────────────────────────────
    const totalFoods = await foodModel.countDocuments();
    const totalUsers = await userModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();

    console.log("\n╔══════════════════════════════════════╗");
    console.log("║        🌱  Seed Complete!            ║");
    console.log("╠══════════════════════════════════════╣");
    console.log(`║  Foods  : ${String(totalFoods).padStart(4)}                     ║`);
    console.log(`║  Users  : ${String(totalUsers).padStart(4)}                     ║`);
    console.log(`║  Orders : ${String(totalOrders).padStart(4)}                     ║`);
    console.log("╠══════════════════════════════════════╣");
    console.log("║  Admin Login:                        ║");
    console.log("║    Email: admin@fooddelivery.com     ║");
    console.log("║    Pass : admin123                   ║");
    console.log("║  Demo Login:                         ║");
    console.log("║    Email: demo@fooddelivery.com      ║");
    console.log("║    Pass : demo1234                   ║");
    console.log("╚══════════════════════════════════════╝");
  } catch (error) {
    console.error("❌  Seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌  Disconnected from MongoDB");
  }
}

seed();
