# Web_Engineering_2024

## Docker

### Compilar

```bash
docker compose up -d
```


### Apagar

Parar a execução dos containers
```bash
docker stop web_engineering_2024-mongodb-1 
docker stop web_engineering_2024-recursos-web
```

Remover os containers e a respetiva imagem
```bash
docker rm web_engineering_2024-mongodb-1
docker rm web_engineering_2024-recursos-web
docker rm web_engineering_2024-mongodb-seed
docker rmi web_engineering_2024-recursos-web
```


### Debug

Para obter informações de debug sobre o servidor, devemos utilizar o seguinte codigo
```
docker logs web_engineering_2024-recursos-web
```
