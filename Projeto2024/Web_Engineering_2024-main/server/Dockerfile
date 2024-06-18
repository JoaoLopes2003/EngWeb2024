FROM node

WORKDIR /app

COPY . .


RUN npm install mongoose
RUN npm i mathjs
RUN npm i express-session --save
RUN npm i session-file-store --save
RUN npm i passport passport-local --save
RUN npm i passport-local-mongoose --save
RUN npm i jsonwebtoken --save


RUN npm install

EXPOSE 15001

CMD ["npm", "start"]