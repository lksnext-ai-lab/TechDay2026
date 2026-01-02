from database import SessionLocal
from models import Machine, Incident, IncidentLog
from datetime import datetime

def seed():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(Machine).first():
        print("Database already seeded.")
        return

    print("Seeding database...")

    # Machines
    machines = [
        Machine(id='APP001', type='Lavadora', brand='Fagor', model='3KB-8800', serial='FGR-W-8800-01', location='Cocina', available=True),
        Machine(id='APP002', type='Frigorífico', brand='Samsung', model='RF260', serial='SMG-F-260-22', location='Cocina', available=True),
        Machine(id='APP003', type='Secadora', brand='Bosch', model='Serie 6', serial='BSC-D-600-99', location='Lavandería', available=True),
        Machine(id='APP004', type='Horno', brand='Beko', model='BIE22300', serial='BKO-O-223-11', location='Cocina', available=False),
        Machine(id='APP005', type='Lavavajillas', brand='Fagor', model='LVF-13', serial='FGR-D-13-55', location='Cocina', available=True)
    ]
    db.add_all(machines)

    # Incidents
    incidents = [
        Incident(
            id='INC-001',
            machine_id='APP001',
            title='Centrifugado ruidoso',
            description='La lavadora hace un ruido muy fuerte al centrifugar a altas revoluciones.',
            status='open',
            priority='high',
            reported_by='Cliente Final',
            created_at=datetime(2024, 5, 10, 9, 30)
        ),
        Incident(
            id='INC-002',
            machine_id='APP004',
            title='No calienta',
            description='El horno enciende pero no alcanza la temperatura deseada.',
            status='in_progress',
            priority='critical',
            reported_by='Cliente Final',
            created_at=datetime(2024, 5, 11, 8, 0)
        ),
        Incident(
            id='INC-003',
            machine_id='APP002',
            title='Fuga de agua',
            description='Pequeño charco de agua bajo el frigorífico.',
            status='resolved',
            priority='medium',
            reported_by='Cliente Final',
            created_at=datetime(2024, 5, 8, 14, 20),
            closed_at=datetime(2024, 5, 9, 11, 5)
        )
    ]
    db.add_all(incidents)

    # Logs
    logs = [
        IncidentLog(incident_id='INC-001', author='Sistema', text='Incidencia creada.', date=datetime(2024, 5, 10, 9, 35)),
        IncidentLog(incident_id='INC-001', author='Téc. Maria', text='Solicitada visita técnica.', date=datetime(2024, 5, 10, 10, 0)),
        IncidentLog(incident_id='INC-002', author='Sistema', text='Incidencia creada.', date=datetime(2024, 5, 11, 8, 0)),
        IncidentLog(incident_id='INC-002', author='Téc. Pedro', text='Resistencia quemada. Repuesto solicitado.', date=datetime(2024, 5, 11, 9, 15)),
        IncidentLog(incident_id='INC-003', author='Sistema', text='Incidencia creada.', date=datetime(2024, 5, 8, 14, 20)),
        IncidentLog(incident_id='INC-003', author='Téc. Maria', text='Desagüe desatascado.', date=datetime(2024, 5, 9, 11, 0))
    ]
    db.add_all(logs)

    db.commit()
    db.close()
    print("Seeding completed.")

if __name__ == "__main__":
    seed()
