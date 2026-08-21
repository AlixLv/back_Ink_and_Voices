-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "type_type_name_key" ON "type"("type_name");

-- CreateIndex
CREATE UNIQUE INDEX "theme_theme_name_key" ON "theme"("theme_name");

-- CreateIndex
CREATE UNIQUE INDEX "book_author_title_key" ON "book"("author", "title");
