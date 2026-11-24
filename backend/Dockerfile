
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore backend.csproj
RUN dotnet publish backend.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:10000
ENV TNS_ADMIN=/app/wallet

EXPOSE 10000

ENTRYPOINT ["/bin/sh", "-c", "set -e; umask 077; mkdir -p /app/wallet; base64 -d /etc/secrets/cwallet.sso.b64 > /app/wallet/cwallet.sso; cp /etc/secrets/tnsnames.ora /app/wallet/tnsnames.ora; cp /etc/secrets/sqlnet.ora /app/wallet/sqlnet.ora; exec dotnet backend.dll"]
