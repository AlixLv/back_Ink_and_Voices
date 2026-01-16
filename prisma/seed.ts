import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {

  
  const regularUser = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      username: 'Alice',
      password: "verysecurepassword",
      role: 'user'
    },
  })
  const adminUser = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      username: 'Bob',
      password: "verysecurepassword",
      role: 'admin'
    },
  })

  console.log("🪪 Users: ", { regularUser, adminUser })

const novelType = await prisma.type.create({
    data: {
      type_name: 'Novel',
      url_image: 'https://example.com/novel.jpg',
    },
  });

  const poetryType = await prisma.type.create({
    data: {
      type_name: 'Poetry',
      url_image: 'https://example.com/poetry.jpg',
    },
  });

  console.log('✅ Types');

const racismTheme = await prisma.theme.create({
    data: { theme_name: 'Racism' },
  });

  const feminismTheme = await prisma.theme.create({
    data: { theme_name: 'Feminism' },
  });

  const adventureTheme = await prisma.theme.create({
    data: { theme_name: 'Adventure' },
  });

  console.log('✅ Themes');

  const book1 = await prisma.book.create({
    data: {
      type_id: poetryType.id,
      title: 'The Black Unicorn',
      author: 'Audre Lorde',
      publishing_house: 'L\'Arche',
      publication_year: '2021',
      resume: 'The Black Unicorn compiles poems of multifaceted scope. The violence of daily life that affects young black men commingles with Lorde\'s search for the key to unlock the secret of her gender, paying special attention to the role of females in the parental unit.',
      reference_link: 'https://www.arche-editeur.com/livre/la-licorne-noire-712',
      short_description: 'Reflections on womanhood, mothers, rage, sorriw, solstice, religion, fear and rape.',
      status: 'pending',
      user_id: regularUser.id,
      themes: {
        create: [
          { theme_id: racismTheme.id },
          { theme_id: feminismTheme.id },
        ],
      },
    },
  });

  console.log('✅ Book created:', book1.title)

  await prisma.book.update({
    where: { id: book1.id },
    data: { status: 'validated' },
  });

  console.log('✅ Book validated');

}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error while seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })