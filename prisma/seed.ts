import { PrismaClient } from '../src/generated/prisma/client';
//import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL,
});

const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({ adapter });

async function main() {

  
  const regularUser = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      username: 'Alice',
      password: await argon2.hash("verysecurepassword"),
      role: 'user'
    },
  })
  const adminUser = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      username: 'Bob',
      password: await argon2.hash("verysecurepassword"),
      role: 'admin'
    },
  })

  console.log("🪪 Users: ", { regularUser, adminUser })


// je peux pas upsert parce que les champs de cette table doivent être uniques. On peut le faire avec un @unique dans le schema
//const novelType = await prisma.type.create({
const novelType = await prisma.type.upsert({
  where: { type_name: 'Roman' },
  update: {},   
  create: {
      type_name: 'Roman',
      url_image: 'https://example.com/novel.jpg',
    },
  });


  // upsert ne marche pas avec les string, askip. Ca doit être un input dynamique, peut-être. Voir la doc.
  const poetryType = await prisma.type.upsert({
  //const poetryType = await prisma.type.create({
    where: { type_name: 'Poésie' },
    update: {},
    create: {
      type_name: 'Poésie',
      url_image: 'https://example.com/poetry.jpg',
    },
  });

  const shortStoriesType = await prisma.type.create({
    data: {
      type_name: 'Recueil de nouvelles',
      url_image: 'https://example.com/poetry.jpg',
    },
  });

  console.log('✅ Types');

const racismTheme = await prisma.theme.upsert({
    where: {theme_name: 'Racisme'},
    update: {},
    data: { theme_name: 'Racisme' },
  });

  const feminismTheme = await prisma.theme.create({
    data: { theme_name: 'Féminisme' },
  });

  const adventureTheme = await prisma.theme.create({
    data: { theme_name: 'Aventure' },
  });

  const ecologyTheme = await prisma.theme.create({
    data: { theme_name: 'Écologie'}
  })

  console.log('✅ Themes');

  const book1 = await prisma.book.create({
    data: {
      type_id: poetryType.id,
      title: 'La Licorne Noire',
      author: 'Audre Lorde',
      publishing_house: 'L\'Arche',
      publication_year: '2021',
      resume: 'Le recueil La Licorne noire de la poétesse et militante Audre Lorde occupe au sein de ses écrits poétiques une place fondamentale. Ces poèmes d’amour évoquent l’apogée d’une sensualité et l’épanouissement d’une sexualité affranchie des normes sociales, prenant sa prodigieuse vigueur dans les luttes contre toutes les formes de discriminations.',
      reference_link: 'https://www.arche-editeur.com/livre/la-licorne-noire-712',
      short_description: ' Sur fond de mélancolie, toujours empreinte de peur et de fureur, sa parole s’élève, furieuse, impatiente, multiple, créatrice et inspirante.',
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

  const book2 = await prisma.book.create({
    data: {
      type_id: novelType.id,
      title: 'Les Orageuses',
      author: 'Marcia Burnier',
      publishing_house: 'Cambourakis',
      publication_year: '2020',
      resume: " Depuis qu’elle avait revu Mia, l’histoire de vengeance, non, de “rendre justice”, lui trottait dans la tête. On dit pas vengeance, lui avait dit Mia, c’est pas la même chose, là on se répare, on se rend justice parce que personne d’autre n’est disposé à le faire. Lucie n’avait pas été très convaincue par le choix de mot, mais ça ne changeait pas grand-chose. En écoutant ces récits dans son bureau, son cœur s’emballe, elle aurait envie de crier, de diffuser à toute heure dans le pays un message qui dirait On vous retrouvera. Chacun d’entre vous. On sonnera à vos portes, on viendra à votre travail, chez vos parents, même des années après, même lorsque vous nous aurez oubliées, on sera là et on vous détruira.",
      reference_link: 'https://www.cambourakis.com/tout/litterature/francophone/les-orageuses/',
      short_description: 'Un premier roman qui dépeint un gang de filles décidant un jour de reprendre comme elles peuvent le contrôle de leur vie.',
      status: 'pending',
      user_id: regularUser.id,
      themes: {
        create: [
          { theme_id: feminismTheme.id },
        ],
      },
    },
  });

  const book3 = await prisma.book.create({
    data: {
      type_id: shortStoriesType.id,
      title: 'Son corps et autres célébrations',
      author: 'Carmen Maria Machado',
      publishing_house: "Editions de l'Olivier",
      publication_year: '2019',
      resume: "Une femme porte en permanence un ruban vert autour du cou et refuse que son mari le touche, quelle que soit la situation. \n Une autre fait l’« inventaire » de ses amant(e)s tandis qu’autour d’elle, un fléau plonge les États-Unis dans l’angoisse. \nUne autre encore fait une curieuse découverte dans une boutique de robes de bal : les objets familiers et usuels recèlent peut-être une vérité terrifiante...",
      reference_link: 'http://editionsdelolivier.fr/catalogue/9782823614114-son-corps-et-autres-celebrations',
      short_description: ' Les nouvelles de Carmen Maria Machado ne sont d’aucun genre : tour à tour fantastiques, fantaisistes ou proches de la science-fiction, elles préfèrent le trouble à la certitude, l’ombre à la clarté, l’inventivité au classicisme. Elles partagent cependant une ambition commune : dire la réalité de l’expérience des femmes et la violence qui s’exerce sur leurs corps.',
      status: 'pending',
      user_id: regularUser.id,
      themes: {
        create: [
          { theme_id: feminismTheme.id },
        ],
      },
    },
  });

  const book4 = await prisma.book.create({
    data: {
      type_id: novelType.id,
      title: 'Les Tentacules',
      author: 'Rita Indiana',
      publishing_house: "Rue de L'Échiquier",
      publication_year: '2020',
      resume: 'En 2027, dans une République dominicaine marquée par plusieurs catastrophes écologiques, Acilde, adolescente pauvre, est depuis peu la servante d’Esther Escudero, grande prêtresse de la Santería. Elle cherche à vendre illégalement l’anémone que possède sa patronne pour acquérir le Rainbow Bright, une drogue qui lui permettrait de changer de sexe sans intervention chirurgicale. Simultanément, au début des années 2000, Argenis, artiste en perdition, est invité en résidence par un couple de mécènes qui souhaite créer un sanctuaire marin afin de protéger les récifs coralliens de Sosua.',
      reference_link: 'https://www.ruedelechiquier.net/fiction/282-les-tentacules.html',
      short_description: '« Un roman inclassable et merveilleux, dont l’intrigue ne saurait se laisser résumer : entre Blade Runner et Proust, on passe de la pollution des océans au sexe, des estampes de Goya aux divinités afro-antillaises des Caraïbes. » Estrella de Diego, El País',
      status: 'pending',
      user_id: regularUser.id,
      themes: {
        create: [
          { theme_id: feminismTheme.id },
          { theme_id: ecologyTheme.id }
        ],
      },
    },
  });

  

  console.log('✅ Books created:', book1.title, ',', book2.title,',', book3.title,',', book4.title)

  await prisma.book.updateMany({
    where: { id: { in: [ book1.id, book2.id, book3.id, book4.id ] } },
    data: { status: 'validated' },
  });

  console.log('✅ Books validated');

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