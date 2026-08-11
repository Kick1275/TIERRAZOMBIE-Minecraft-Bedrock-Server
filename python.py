# Menu


import webbrowser

opcion = int(input("""Seleccione una opción:\n 1. Opción 1\n  2. Opción 2\n 3. Opción 3\n  4. Opción 4\n  Ingrese el número de la opción:"""))

# Habrir un enlace a youtube
def h_yt():
    webbrowser.open("https://www.youtube.com/")

def tablas():
    num1 = int(input("Ingrese un número para generar su tabla de multiplicar: "))
    num2 = int(input("Ingrese el rango: "))
    for i in range(1, num2 + 1):
        print(f"{num1} x {i} = {num1 * i}")


def array():
    array = ["pepe", "juan", "maria", "luis"]
    while True:
         for i in range(len(array)):
              print(array[i])
         array.append(input("Ingrese un nombre para agregar al array: "))
         exit = input("¿Desea salir del programa? (s/n): ")
         if exit.lower() == "s":
             break

def db ():
      person = [
        {
            "nombre": "Luwy",
            "apellido": "Sanez",
            "edad": 16,
            "profesion": "Desarrollador de software"
        },
        {
            "nombre": "Juan",
            "apellido": "Perez",
            "edad": 25,
            "profesion": "Ingeniero civil"
        }
      ]
      while True:
        print("Opcion 1: Mostrar personas")
        print("Opcion 2: Ingresar nueva persona")
        print("Opcion 3: Salir")
        selection = input("Ingrese la accion que desea realizar: ")
        if selection == "1":
            for p in person:
                print(f"Nombre: {p['nombre']}, Apellido: {p['apellido']}, Edad: {p['edad']}, Profesion: {p['profesion']}")
        elif selection == "2":
            nombre = input("Ingrese el nombre: ")
            apellido = input("Ingrese el apellido: ")
            edad = int(input("Ingrese la edad: "))
            profesion = input("Ingrese la profesion: ")
            person.append({
                "nombre": nombre,
                "apellido": apellido,
                "edad": edad,
                "profesion": profesion
            })
        elif selection == "3":
            break


if opcion == 1:
     h_yt()
elif opcion == 2:
    tablas()
elif opcion == 3:
    array()
elif opcion == 4:
    db()
else:
        print("Opción no válida")
