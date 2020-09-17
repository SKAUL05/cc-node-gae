FROM node:12

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

RUN npm install

EXPOSE 8080
CMD [ "node", "app.js" ]
