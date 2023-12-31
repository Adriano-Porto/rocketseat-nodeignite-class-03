import { Gym, Prisma } from '@prisma/client'
import { FindManyNearbyParams, GymsRepository } from '../gyms-repository'
import { randomUUID } from 'crypto'
import { Decimal } from '@prisma/client/runtime/library'
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates'


export class InMemoryGymsRepository implements GymsRepository {
	public items: Gym[] = []
    
	async findById(id: string) {
		const gym = this.items.find(item => item.id === id)

		if (!gym) {
			return null
		}

		return gym
	}

	async create(data: Prisma.GymCreateInput) {
		const gym = {
			id: data.id ?? randomUUID(),
			title: data.title,
			description: data.description ?? null,
			phone: data.phone,
			created_at: new Date(),
			latitude: new Decimal(data.latitude.toString()),
			longitude: new Decimal(data.longitude.toString())
		}

		this.items.push(gym)
		return gym
	}

	async searchMany(query: string, page:number) {
		return this.items.filter(item => item.title.includes(query))
			.slice((page-1) * 20, page * 20)
	}

	async  findManyNearby(params: FindManyNearbyParams) {
		return this.items.filter(item => {
			const distance = getDistanceBetweenCoordinates({
				latitute:params.latitude, longitude: params.longitude
			},
			{ latitute: item.latitude.toNumber(), longitude: item.longitude.toNumber()})
			return distance < 10
		})
	}
}