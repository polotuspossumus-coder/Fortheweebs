def validate_slab_execution(slab_name, user_tier, required_tier="Mythic"):
    if user_tier != required_tier:
        raise PermissionError(f"{slab_name} requires {required_tier} tier.")
    return f"{slab_name} validated for {user_tier} tier."
