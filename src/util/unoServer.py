import unoserver

def start_unoserver():
    try:
        # Start the Uno server using unoserver functions
        # Specify the port as 2002
        unoserver.start_server(port=2002)
    except Exception as e:
        print(f"Error starting unoserver: {e}")

if __name__ == "__main__":
    start_unoserver()
