FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/DormitoryManagement.Domain/DormitoryManagement.Domain.csproj", "src/DormitoryManagement.Domain/"]
COPY ["src/DormitoryManagement.Application/DormitoryManagement.Application.csproj", "src/DormitoryManagement.Application/"]
COPY ["src/DormitoryManagement.Infrastructure/DormitoryManagement.Infrastructure.csproj", "src/DormitoryManagement.Infrastructure/"]
COPY ["src/DormitoryManagement.API/DormitoryManagement.API.csproj", "src/DormitoryManagement.API/"]

RUN dotnet restore "src/DormitoryManagement.API/DormitoryManagement.API.csproj"

COPY . .
WORKDIR "/src/src/DormitoryManagement.API"
RUN dotnet build "DormitoryManagement.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DormitoryManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DormitoryManagement.API.dll"]

