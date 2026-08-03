import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.persistence.models.issue_model import CategoryModel, DepartmentModel


async def seed_initial_data(session: AsyncSession) -> None:
    """
    Seeds default municipal departments and issue categories if they do not exist.
    """
    stmt = select(DepartmentModel)
    res = await session.execute(stmt)
    existing_dept = res.first()

    if not existing_dept:
        pw_roads = DepartmentModel(
            id=uuid.uuid4(),
            name="Public Works & Roads",
            code="PW_ROADS",
            description="Road repairs, potholes, sidewalk maintenance",
            is_active=True
        )
        elec = DepartmentModel(
            id=uuid.uuid4(),
            name="Electrical & Street Lighting",
            code="ELEC_LIGHTS",
            description="Streetlights, transformers, electrical hazards",
            is_active=True
        )
        water = DepartmentModel(
            id=uuid.uuid4(),
            name="Water Supply & Sanitation",
            code="WATER_SAN",
            description="Pipe leaks, water supply, sewage and drainage",
            is_active=True
        )
        waste = DepartmentModel(
            id=uuid.uuid4(),
            name="Waste Management & Environment",
            code="WASTE_MGMT",
            description="Garbage collection, waste dumping, public parks",
            is_active=True
        )

        session.add_all([pw_roads, elec, water, waste])
        await session.flush()

        cat1 = CategoryModel(
            id=uuid.uuid4(),
            name="Potholes & Road Damage",
            description="Hazardous potholes, damaged road asphalt, or broken sidewalks.",
            default_department_id=pw_roads.id,
            default_sla_hours=48,
            is_active=True
        )
        cat2 = CategoryModel(
            id=uuid.uuid4(),
            name="Streetlight & Electrical Failure",
            description="Non-functioning streetlights, exposed wiring, or dark intersections.",
            default_department_id=elec.id,
            default_sla_hours=24,
            is_active=True
        )
        cat3 = CategoryModel(
            id=uuid.uuid4(),
            name="Water Pipeline & Sewage Leakage",
            description="Leaking water supply mains, pipe bursts, or sewage overflow.",
            default_department_id=water.id,
            default_sla_hours=12,
            is_active=True
        )
        cat4 = CategoryModel(
            id=uuid.uuid4(),
            name="Garbage & Waste Accumulation",
            description="Uncollected municipal trash, illegal dumping, or overflowing bins.",
            default_department_id=waste.id,
            default_sla_hours=24,
            is_active=True
        )
        cat5 = CategoryModel(
            id=uuid.uuid4(),
            name="Drainage & Flooding Blockage",
            description="Blocked storm drains, localized waterlogging, or gutter overflow.",
            default_department_id=water.id,
            default_sla_hours=24,
            is_active=True
        )
        cat6 = CategoryModel(
            id=uuid.uuid4(),
            name="Other",
            description="Custom citizen query or unlisted infrastructure category.",
            default_department_id=pw_roads.id,
            default_sla_hours=48,
            is_active=True
        )

        session.add_all([cat1, cat2, cat3, cat4, cat5, cat6])
        await session.commit()

    # Ensure "Other" category exists if database was already partially seeded
    cat_stmt = select(CategoryModel).where(CategoryModel.name == "Other")
    cat_res = await session.execute(cat_stmt)
    if not cat_res.scalar_one_or_none():
        dept_stmt = select(DepartmentModel)
        dept_res = await session.execute(dept_stmt)
        first_dept = dept_res.scalars().first()
        if first_dept:
            other_cat = CategoryModel(
                id=uuid.uuid4(),
                name="Other",
                description="Custom citizen query or unlisted infrastructure category.",
                default_department_id=first_dept.id,
                default_sla_hours=48,
                is_active=True
            )
            session.add(other_cat)
            await session.commit()
