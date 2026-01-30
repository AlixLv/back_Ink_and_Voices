# Ink & Voices

A collaborative database platform dedicated to promoting and cataloging works by women authors and authors from gender minorities.

You are in the backend repository. For the frontend repository, have a look [here](https://github.com/AlixLv/front_Ink_and_Voices)

## 📖 About the Project

This project was born from the realisation there was a significant lack of representation of women and gender minority authors in the most commonly used databases. Then, we created an inclusive, community-driven database that addresses this gap and makes diverse literature more discoverable for everyone.
This app provides developers and readers an easy access to a comprehensive database of underrepresented authors. By making this data available via API, we aim to help others who face the same challenges we encountered in finding diverse literary resources. Readers will also be able to look through our database thanks to our website.

### ✨ Key Features

- **Collaborative Contributions**: Community members can propose books to add to the database
- **Moderation System**: Administrators review and validate or reject submissions to ensure quality and accuracy
- **Public API**: Developers can access the database through our API to integrate diverse author data into their own projects
- **Focus on Representation**: Dedicated to highlighting women authors and authors from gender minorities

## Getting Started
### Dependencies
- Docker

### Installing
  
- git clone the repository : <https://github.com/AlixLv/front_Ink_and_Voices>  
- Run Docker Desktop (Windows, Linux) or ... (Mac)  
"build the project from the docker-compose"  
`docker-compose up --build -d`  

The Fastify server should be running.  

kill the container:  
`docker-compose down`  

start the container:  
`docker start back_dev_ink_and_voices_dev-1`  

stop the container:  
`docker stop back_dev_ink_and_voices_dev-1`  

enter the container:  
`docker exec -ti back_dev_ink_and_voices_dev-1 sh`  

***

#### Modify the database  
The database shouldn't be modified. Anyways, if you consider some datas should be added, contact us by [mail](inkandvoices264@gmail.com)  

***

#### PgAdmin Connection
todo

### Running tests
todo

## Architecture and patterns
### Security
todo

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript

### Backend
- Fastify
- TypeScript

### Database
- PostgreSQL
- Prisma


## 📚 Usage Specificities

### For Contributors
1. Browse the existing database
2. Submit new book proposals through the contribution form
3. Track the status of your submissions

### For Administrators
1. Access the admin dashboard
2. Review pending submissions
3. Validate or reject contributions with feedback

### For Developers
Access our API at `[API_URL]` to integrate diverse author data into your applications. //TBD

API Documentation: //TBD

## 🤝 Contributing

We welcome contributions from the community! Whether you're adding books, improving code, or fixing bugs, your help is appreciated.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

//TBD

## 👥 Team

This project is being developed as part of our RNCP6 certification.

- [Alix Levé](https://github.com/AlixLv)
- [Térence Da Conceiçao](https://github.com/terence-da-conceicao)
- [Lauriane Marques](https://github.com/Lauriane-Marques)

## 📧 Contact

For questions or suggestions, please reach out to <inkandvoices264@gmail.com>

## 🙏 Acknowledgments

- Thanks to all contributors who help make literature more diverse and accessible
- Inspired by the need for better representation in technology and literature

---

**Note**: This project is currently in active development as part of our RNCP6 certification program.