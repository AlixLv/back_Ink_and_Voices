---
name: PR - Template
about: Describe your PR accuratly
title: ''
labels: ''
assignees: ''

---

### Titre
[Décris en une phrase ce que fait cette PR et quel problème cela résout.]
[ Exemple : 
"rajout endpoint 'POST' home/add_book/
Feature d'ajout d'un livre]

### Contexte / Pourquoi
[Ticket lié sur trello : lien ou numéro]
[Pourquoi ce changement? Quelle différence avec avant? ]


### Changements
[ liste des fichiers modifiés et ce qu'ils font globalement. Sous forme de liste à puces. On peut vérifier la liste des fichiers dans l'onglet Files changed de la PR.

Exemple : 
home/add_book/views.ts ---> endpoint 'POST' api/v1/home/add_book/ . Lié à la permission 'utilisateur connecté']
home/add_books/controller.ts ----> Logique d'ajout de livre. Vérification validité livre.
home/add_books/tests.ts


### Flow
[ quelle nouvelle variable contient quoi? quelle data est envoyée où? Comment ça marche?]
[ Globalement la même chose que dans Changements mais en précis pour qu'on comprenne comment ça marche]


### Comment tester
Liste des tests : 
test_user_can_add_book
tests_book_is_not_forbidden
test_user_can_not_add_already_existing_book


[ Comment tester manuellement
Exemple : 
se login avec localhost:0000:http://login/
appeler la route add_book/
emplir les informations du livre
Cliquer sur valider
Observer la réponse]

### Checklist
- [ ] Les tests passent localement (npx task run-tests)
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai vérifié qu'il n'y a pas de console.log oubliés
- [ ] J'ai vérifié que ma feature respecte bien les attentes
- [ ] J'ai pensé aux cas limites, ils sont testés


#### Screenshots
[Si nécessaire, plutôt utile pour le front]



#### Notes
[ eventuels points de débats, ou indications, par exemple "ne pas merge avant telle PR", "j'ai choisi de faire ça comme ça plutôt que comme ça parce que ça"]
[ c'est aussi l'endroit où on peut décrire les obstacles rencontrés ou les bugs que cette PR peut amener et qui devront être corrigés dans de prochains tickets]
